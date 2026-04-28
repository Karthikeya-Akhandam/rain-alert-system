from unittest.mock import patch
from app.weather.parser import NormalizedForecast

def test_preview_empty(client):
    # Setup Admin Auth
    client.post("/auth/signup", json={
        "name": "A", "email": "a@e.com", "password": "password123",
        "lat": 0, "lon": 0, "channel": "email"
    })
    r_login = client.post("/auth/login", data={"username": "a@e.com", "password": "password123"})
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r = client.post("/runs/preview", json={"user_ids": []}, headers=headers)
    assert r.status_code == 200
    assert r.json()["results"] == []


@patch("app.api.routes_runs.WeatherClient")
def test_preview_with_user(mock_cls, client):
    # Setup Admin Auth
    client.post("/auth/signup", json={
        "name": "A", "email": "a@e.com", "password": "password123",
        "lat": 0, "lon": 0, "channel": "email"
    })
    r_login = client.post("/auth/login", data={"username": "a@e.com", "password": "password123"})
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

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
    r = client.post("/runs/preview", json={}, headers=headers)
    assert r.status_code == 200
    assert len(r.json()["results"]) == 1
    inst.close.assert_called()
