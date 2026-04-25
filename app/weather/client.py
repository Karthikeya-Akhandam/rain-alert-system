from __future__ import annotations

import logging
from typing import Any

import requests
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import Settings
from app.weather.parser import NormalizedForecast, parse_weather_payload

logger = logging.getLogger(__name__)


class WeatherError(Exception):
    pass


class WeatherClient:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._session = requests.Session()
        self._session.headers.update({"Accept": "application/json"})

    def close(self) -> None:
        self._session.close()

    @retry(reraise=True, stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.5, min=0.5, max=8))
    def fetch_forecast(self, lat: float, lon: float) -> dict[str, Any]:
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "precipitation_probability,precipitation,weather_code",
            "timezone": "UTC",
        }
        resp = self._session.get(self._settings.open_meteo_base_url, params=params, timeout=20)
        if resp.status_code == 429:
            raise WeatherError("Weather API rate limited")
        if not resp.ok:
            logger.warning("Weather API HTTP %s", resp.status_code)
            raise WeatherError(f"Weather API HTTP {resp.status_code}")
        return resp.json()

    def forecast_for_coordinates(self, lat: float, lon: float) -> NormalizedForecast:
        payload = self.fetch_forecast(lat, lon)
        return parse_weather_payload(lat, lon, payload)
