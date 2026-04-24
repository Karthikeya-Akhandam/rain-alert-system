from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

from app.config import Settings
from app.notify.base import SendResult

logger = logging.getLogger(__name__)


class SmtpEmailSender:
    def __init__(self, settings: Settings) -> None:
        self._s = settings

    def send(self, to_email: str, subject: str, body: str) -> SendResult:
        if not self._s.smtp_enabled:
            return SendResult(False, error="SMTP disabled")
        if not (self._s.smtp_host and self._s.smtp_from):
            return SendResult(False, error="SMTP not configured")
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = self._s.smtp_from
        msg["To"] = to_email
        msg.set_content(body)
        try:
            if self._s.smtp_use_tls:
                with smtplib.SMTP(self._s.smtp_host, self._s.smtp_port, timeout=30) as smtp:
                    smtp.ehlo()
                    smtp.starttls()
                    smtp.ehlo()
                    if self._s.smtp_user:
                        smtp.login(self._s.smtp_user, self._s.smtp_password)
                    smtp.send_message(msg)
            else:
                with smtplib.SMTP_SSL(self._s.smtp_host, self._s.smtp_port, timeout=30) as smtp:
                    if self._s.smtp_user:
                        smtp.login(self._s.smtp_user, self._s.smtp_password)
                    smtp.send_message(msg)
            return SendResult(True, provider_message_id=None)
        except Exception as exc:  # noqa: BLE001
            logger.exception("SMTP send failed")
            return SendResult(False, error=str(exc))
