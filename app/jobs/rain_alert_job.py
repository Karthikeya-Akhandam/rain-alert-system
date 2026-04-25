from __future__ import annotations

import logging
from datetime import datetime, timezone

from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.orm import Session

from app.config import Settings
from app.decision.engine import RainDecisionEngine
from app.notify.email_sender import SmtpEmailSender
from app.notify.router import NotificationRouter
from app.notify.sms_sender import TwilioSmsSender
from app.repository import history as history_repo
from app.repository import users as users_repo
from app.weather.client import WeatherClient, WeatherError

logger = logging.getLogger(__name__)


def _render_email_body(user_name: str, reason: str, lat: float, lon: float) -> str:
    env = Environment(
        loader=FileSystemLoader("templates"),
        autoescape=select_autoescape(enabled_extensions=(".html",)),
    )
    try:
        tpl = env.get_template("email_alert.txt")
        return tpl.render(name=user_name, reason=reason, lat=lat, lon=lon)
    except Exception:  # noqa: BLE001
        return (
            f"Hello {user_name},\n\n"
            f"Rain may affect your area soon.\nReason: {reason}\n"
            f"Location: {lat}, {lon}\n"
        )


def run_rain_alert_job(
    db: Session,
    settings: Settings,
    *,
    dry_run: bool = False,
) -> tuple[int, int, int, int]:
    client = WeatherClient(settings)
    engine = RainDecisionEngine()
    email_sender = SmtpEmailSender(settings)
    sms_sender = TwilioSmsSender(settings)
    router = NotificationRouter(email_sender, sms_sender)

    run = history_repo.create_run(db)
    users = users_repo.list_users(db)
    users_processed = 0
    alerts_sent = 0
    alerts_failed = 0
    api_failures = 0
    final_status = "completed"

    try:
        for user in users:
            users_processed += 1
            try:
                forecast = client.forecast_for_coordinates(user.lat, user.lon)
            except WeatherError:
                api_failures += 1
                logger.warning("Weather fetch failed for user %s", user.id)
                continue
            decision = engine.evaluate(user, forecast)
            if not decision.should_alert:
                continue
            subject = "Rain alert: precipitation likely soon"
            body = _render_email_body(user.name, decision.reason, user.lat, user.lon)
            if dry_run:
                continue
            any_ok = False
            for channel, result in router.alert_user(user, subject, body):
                st = "sent" if result.ok else "failed"
                if result.ok:
                    any_ok = True
                    alerts_sent += 1
                else:
                    alerts_failed += 1
                history_repo.add_notification_attempt(
                    db,
                    run_id=run.id,
                    user_id=user.id,
                    channel=channel,
                    status=st,
                    provider_message_id=result.provider_message_id,
                    error=result.error,
                )
            if any_ok:
                users_repo.mark_last_alert(db, user.id, datetime.now(timezone.utc))
    except Exception:
        logger.exception("Run failed")
        final_status = "failed"
        raise
    finally:
        client.close()
        history_repo.finish_run(
            db,
            run,
            users_processed=users_processed,
            alerts_sent=alerts_sent,
            alerts_failed=alerts_failed,
            api_failures=api_failures,
            status=final_status,
        )

    return run.id, users_processed, alerts_sent, alerts_failed
