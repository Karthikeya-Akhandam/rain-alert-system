from types import SimpleNamespace

from app.config import Settings
from app.notify.email_sender import SmtpEmailSender
from app.notify.router import NotificationRouter
from app.notify.sms_sender import TwilioSmsSender


def test_router_sends_email_when_channel_email():
    s = Settings()
    r = NotificationRouter(SmtpEmailSender(s), TwilioSmsSender(s))
    u = SimpleNamespace(
        id=1,
        name="n",
        email="e@e.e",
        phone_e164=None,
        lat=0,
        lon=0,
        rain_pop_threshold=0.5,
        rain_mm_per_h_threshold=None,
        cooldown_minutes=0,
        channel="email",
    )
    out = r.alert_user(u, "s", "b")
    assert out[0][0] == "email"
