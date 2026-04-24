from __future__ import annotations

from app.db_models import User
from app.notify.base import SendResult
from app.notify.email_sender import SmtpEmailSender
from app.notify.sms_sender import TwilioSmsSender


class NotificationRouter:
    def __init__(self, email: SmtpEmailSender, sms: TwilioSmsSender) -> None:
        self._email = email
        self._sms = sms

    def alert_user(self, user: User, subject: str, body: str) -> list[tuple[str, SendResult]]:
        results: list[tuple[str, SendResult]] = []
        ch = user.channel
        if ch in ("email", "both") and user.email:
            results.append(("email", self._email.send(user.email, subject, body)))
        if ch in ("sms", "both") and user.phone_e164:
            results.append(("sms", self._sms.send(user.phone_e164, f"{subject}\n{body}")))
        if not results:
            results.append(("none", SendResult(False, error="no_recipient_for_channel")))
        return results
