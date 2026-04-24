from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.db_models import NotificationAttempt, Run


def create_run(db: Session) -> Run:
    r = Run(status="running")
    db.add(r)
    db.flush()
    return r


def finish_run(
    db: Session,
    run: Run,
    *,
    users_processed: int,
    alerts_sent: int,
    alerts_failed: int,
    api_failures: int,
    status: str = "completed",
) -> Run:
    run.finished_at = datetime.now(timezone.utc)
    run.users_processed = users_processed
    run.alerts_sent = alerts_sent
    run.alerts_failed = alerts_failed
    run.api_failures = api_failures
    run.status = status
    db.flush()
    return run


def list_runs(db: Session, limit: int = 50) -> list[Run]:
    return list(db.scalars(select(Run).order_by(desc(Run.started_at)).limit(limit)))


def get_run(db: Session, run_id: int) -> Run | None:
    return db.get(Run, run_id)


def add_notification_attempt(
    db: Session,
    *,
    run_id: int,
    user_id: int,
    channel: str,
    status: str,
    provider_message_id: str | None = None,
    error: str | None = None,
) -> NotificationAttempt:
    n = NotificationAttempt(
        run_id=run_id,
        user_id=user_id,
        channel=channel,
        status=status,
        provider_message_id=provider_message_id,
        error=error,
    )
    db.add(n)
    db.flush()
    return n


def list_notifications_for_run(db: Session, run_id: int) -> list[NotificationAttempt]:
    return list(
        db.scalars(
            select(NotificationAttempt)
            .where(NotificationAttempt.run_id == run_id)
            .order_by(NotificationAttempt.id)
        )
    )
