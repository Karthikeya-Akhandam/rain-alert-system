from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any


@dataclass(frozen=True)
class HourlySlice:
    dt_unix: int
    pop: float | None
    rain_mm_per_h: float | None
    weather_main: str | None


@dataclass(frozen=True)
class NormalizedForecast:
    lat: float
    lon: float
    timezone: str | None
    next_hour_pop: float | None
    next_hour_rain_mm_per_h: float | None
    minutely_precip_sum_next_60m_mm: float | None
    hourly_next_3h: tuple[HourlySlice, ...]


def _iso_to_unix(iso_str: str) -> int:
    try:
        # Open-Meteo uses "YYYY-MM-DDTHH:MM" format
        dt = datetime.fromisoformat(iso_str).replace(tzinfo=timezone.utc)
        return int(dt.timestamp())
    except (ValueError, TypeError):
        return 0


def parse_weather_payload(lat: float, lon: float, payload: dict[str, Any]) -> NormalizedForecast:
    hourly_data = payload.get("hourly", {})
    times = hourly_data.get("time", [])
    pops = hourly_data.get("precipitation_probability", [])
    precips = hourly_data.get("precipitation", [])
    codes = hourly_data.get("weather_code", [])

    hourly_slices: list[HourlySlice] = []
    # Process up to 12 hours
    for i in range(min(len(times), 12)):
        pop_val = pops[i] if i < len(pops) else None
        # Convert 0-100% to 0.0-1.0
        pop_float = float(pop_val) / 100.0 if pop_val is not None else None
        
        precip_val = precips[i] if i < len(precips) else None
        precip_float = float(precip_val) if precip_val is not None else None
        
        # We don't have a direct "weather_main" string like OpenWeather, 
        # but we could map WMO codes if needed. For now, we'll keep it simple.
        code_val = str(codes[i]) if i < len(codes) else None

        hourly_slices.append(
            HourlySlice(
                dt_unix=_iso_to_unix(times[i]),
                pop=pop_float,
                rain_mm_per_h=precip_float,
                weather_main=code_val,
            )
        )

    next_pop = hourly_slices[0].pop if hourly_slices else None
    next_rain = hourly_slices[0].rain_mm_per_h if hourly_slices else None

    return NormalizedForecast(
        lat=lat,
        lon=lon,
        timezone=payload.get("timezone"),
        next_hour_pop=next_pop,
        next_hour_rain_mm_per_h=next_rain,
        minutely_precip_sum_next_60m_mm=None,  # Open-Meteo doesn't provide minutely data by default
        hourly_next_3h=tuple(hourly_slices[:3]),
    )
