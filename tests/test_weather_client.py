from unittest.mock import MagicMock, patch

import pytest

from app.config import Settings
from app.weather.client import WeatherClient, WeatherError


@patch("app.weather.client.requests.Session.get")
def test_client_parses_success(mock_get):
    mock_resp = MagicMock()
    mock_resp.ok = True
    mock_resp.json.return_value = {
        "timezone": "UTC",
        "hourly": {
            "time": ["2023-10-01T00:00"],
            "precipitation_probability": [40],
            "precipitation": [0.5],
            "weather_code": [3]
        }
    }
    mock_get.return_value = mock_resp
    s = Settings()
    client = WeatherClient(s)
    fc = client.forecast_for_coordinates(1.0, 2.0)
    assert fc.next_hour_pop == 0.4
    assert fc.next_hour_rain_mm_per_h == 0.5
    client.close()
