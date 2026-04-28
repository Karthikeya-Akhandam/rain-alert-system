from unittest.mock import MagicMock, patch
from app.config import Settings
from app.jobs.rain_alert_job import run_rain_alert_job
from app.weather.parser import NormalizedForecast

@patch("app.jobs.rain_alert_job.WeatherClient")
def test_job_dry_run_skips_notifications(mock_client, client):
    from app.repository.db import get_session_factory

    # Create user via signup
    client.post(
        "/auth/signup",
        json={
            "name": "U",
            "email": "u@e.com",
            "password": "password123",
            "lat": 1,
            "lon": 2,
            "rain_pop_threshold": 0.0,
            "channel": "email",
        },
    )
    factory = get_session_factory()
    db = factory()
    try:
        settings = Settings(
            smtp_enabled=False,
            sms_enabled=False,
        )
        inst = mock_client.return_value
        inst.forecast_for_coordinates.return_value = NormalizedForecast(
            1,
            2,
            "UTC",
            0.99,
            None,
            None,
            (),
        )
        run_id, processed, sent, failed = run_rain_alert_job(db, settings, dry_run=True)
        db.commit()
        assert processed >= 1
        assert sent == 0 and failed == 0
        assert run_id > 0
    finally:
        db.close()
