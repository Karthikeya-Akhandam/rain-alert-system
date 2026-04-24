from __future__ import annotations

import logging
from typing import Any

import requests
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import Settings
from app.weather.parser import NormalizedForecast, parse_onecall_payload

logger = logging.getLogger(__name__)


class OpenWeatherError(Exception):
    pass


class OpenWeatherClient:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._session = requests.Session()
        self._session.headers.update({"Accept": "application/json"})

    def close(self) -> None:
        self._session.close()

    @retry(reraise=True, stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.5, min=0.5, max=8))
    def fetch_onecall(self, lat: float, lon: float, *, units: str = "metric") -> dict[str, Any]:
        key = self._settings.openweather_api_key
        if not key:
            raise OpenWeatherError("OPENWEATHER_API_KEY is not set")
        params = {"lat": lat, "lon": lon, "appid": key, "units": units}
        resp = self._session.get(self._settings.openweather_base_url, params=params, timeout=20)
        if resp.status_code == 401:
            raise OpenWeatherError("OpenWeather authentication failed")
        if resp.status_code == 429:
            raise OpenWeatherError("OpenWeather rate limited")
        if not resp.ok:
            logger.warning("OpenWeather HTTP %s", resp.status_code)
            raise OpenWeatherError(f"OpenWeather HTTP {resp.status_code}")
        return resp.json()

    def forecast_for_coordinates(self, lat: float, lon: float) -> NormalizedForecast:
        payload = self.fetch_onecall(lat, lon)
        return parse_onecall_payload(lat, lon, payload)
