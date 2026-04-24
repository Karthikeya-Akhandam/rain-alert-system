from __future__ import annotations

from dataclasses import dataclass
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


def _hourly_slice(h: dict[str, Any]) -> HourlySlice:
    weather = h.get("weather") or []
    main = weather[0].get("main") if weather else None
    rain = h.get("rain") or {}
    rain_1h = rain.get("1h")
    return HourlySlice(
        dt_unix=int(h.get("dt", 0)),
        pop=float(h["pop"]) if h.get("pop") is not None else None,
        rain_mm_per_h=float(rain_1h) if rain_1h is not None else None,
        weather_main=str(main) if main else None,
    )


def parse_onecall_payload(lat: float, lon: float, payload: dict[str, Any]) -> NormalizedForecast:
    hourly_raw = payload.get("hourly") or []
    hourly = tuple(_hourly_slice(h) for h in hourly_raw[:12])
    next_pop = hourly[0].pop if hourly else None
    next_rain = hourly[0].rain_mm_per_h if hourly else None
    minutely = payload.get("minutely") or []
    precip_sum: float | None = None
    if minutely:
        precip_sum = sum(float(m.get("precipitation") or 0) for m in minutely[:60])
    return NormalizedForecast(
        lat=lat,
        lon=lon,
        timezone=payload.get("timezone"),
        next_hour_pop=next_pop,
        next_hour_rain_mm_per_h=next_rain,
        minutely_precip_sum_next_60m_mm=precip_sum,
        hourly_next_3h=hourly[:3],
    )
