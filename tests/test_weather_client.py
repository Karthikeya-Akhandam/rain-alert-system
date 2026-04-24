from unittest.mock import MagicMock, patch

import pytest

from app.config import Settings
from app.weather.client import OpenWeatherClient, OpenWeatherError


def test_client_requires_api_key():
    s = Settings(openweather_api_key="")
    c = OpenWeatherClient(s)
    with pytest.raises(OpenWeatherError):
        c.fetch_onecall(0, 0)
    c.close()


@patch("app.weather.client.requests.Session.get")
def test_client_parses_success(mock_get):
    mock_resp = MagicMock()
    mock_resp.ok = True
    mock_resp.json.return_value = {
        "timezone": "UTC",
        "hourly": [{"dt": 1, "pop": 0.4, "weather": [{"main": "Clouds"}]}],
        "minutely": [],
    }
    mock_get.return_value = mock_resp
    s = Settings(openweather_api_key="k")
    client = OpenWeatherClient(s)
    fc = client.forecast_for_coordinates(1.0, 2.0)
    assert fc.next_hour_pop == 0.4
    client.close()
