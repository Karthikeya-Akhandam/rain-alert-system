from __future__ import annotations

import logging

from app.config import Settings
from app.notify.base import SendResult

logger = logging.getLogger(__name__)


class TwilioSmsSender:
    def __init__(self, settings: Settings) -> None:
        self._s = settings

    def send(self, to_e164: str, body: str) -> SendResult:
        if not self._s.sms_enabled:
            return SendResult(False, error="SMS disabled")
        if not (
            self._s.twilio_account_sid and self._s.twilio_auth_token and self._s.twilio_from_number
        ):
            return SendResult(False, error="Twilio not configured")
        try:
            from twilio.rest import Client

            client = Client(self._s.twilio_account_sid, self._s.twilio_auth_token)
            msg = client.messages.create(
                body=body[:1500],
                from_=self._s.twilio_from_number,
                to=to_e164,
            )
            return SendResult(True, provider_message_id=msg.sid)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Twilio send failed")
            return SendResult(False, error=str(exc))
