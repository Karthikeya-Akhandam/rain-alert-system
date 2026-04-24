from unittest.mock import patch

from app.weather.parser import NormalizedForecast


def test_preview_empty(client):
    r = client.post("/runs/preview", json={"user_ids": []})
    assert r.status_code == 200
    assert r.json()["results"] == []


@patch("app.api.routes_runs.OpenWeatherClient")
def test_preview_with_user(mock_cls, client):
    client.post(
        "/users",
        json={
            "name": "U",
            "email": "u@e.com",
            "lat": 0,
            "lon": 0,
            "channel": "email",
        },
    )
    inst = mock_cls.return_value
    inst.forecast_for_coordinates.return_value = NormalizedForecast(
        lat=0,
        lon=0,
        timezone="UTC",
        next_hour_pop=0.1,
        next_hour_rain_mm_per_h=None,
        minutely_precip_sum_next_60m_mm=None,
        hourly_next_3h=(),
    )
    r = client.post("/runs/preview", json={})
    assert r.status_code == 200
    assert len(r.json()["results"]) == 1
    inst.close.assert_called()
