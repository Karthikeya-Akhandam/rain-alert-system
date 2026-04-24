from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from app.decision.engine import RainDecisionEngine
from app.weather.parser import NormalizedForecast


def _user(**kwargs):
    defaults = dict(
        id=1,
        name="u",
        email="a@b.c",
        phone_e164=None,
        lat=0.0,
        lon=0.0,
        rain_pop_threshold=0.5,
        rain_mm_per_h_threshold=None,
        cooldown_minutes=60,
        channel="email",
        last_alert_at=None,
    )
    defaults.update(kwargs)
    return SimpleNamespace(**defaults)


def test_pop_above_threshold_triggers():
    eng = RainDecisionEngine()
    u = _user()
    fc = NormalizedForecast(
        lat=0,
        lon=0,
        timezone="UTC",
        next_hour_pop=0.9,
        next_hour_rain_mm_per_h=None,
        minutely_precip_sum_next_60m_mm=None,
        hourly_next_3h=(),
    )
    r = eng.evaluate(u, fc, now=datetime(2026, 1, 1, tzinfo=timezone.utc))
    assert r.should_alert is True


def test_cooldown_blocks():
    eng = RainDecisionEngine()
    now = datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc)
    u = _user(last_alert_at=now - timedelta(minutes=10), cooldown_minutes=60)
    fc = NormalizedForecast(0, 0, "UTC", 1.0, None, None, ())
    r = eng.evaluate(u, fc, now=now)
    assert r.should_alert is False
    assert "cooldown" in r.reason
