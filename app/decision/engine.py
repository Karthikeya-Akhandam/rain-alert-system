from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from app.db_models import User
from app.weather.parser import NormalizedForecast


@dataclass(frozen=True)
class RainDecisionResult:
    should_alert: bool
    reason: str


class RainDecisionEngine:
    def evaluate(
        self,
        user: User,
        forecast: NormalizedForecast,
        *,
        now: datetime | None = None,
    ) -> RainDecisionResult:
        now = now or datetime.now(timezone.utc)
        pop = forecast.next_hour_pop
        rain_rate = forecast.next_hour_rain_mm_per_h
        minutely_sum = forecast.minutely_precip_sum_next_60m_mm

        if user.last_alert_at is not None:
            last = user.last_alert_at
            if last.tzinfo is None:
                last = last.replace(tzinfo=timezone.utc)
            if now - last < timedelta(minutes=user.cooldown_minutes):
                return RainDecisionResult(False, "cooldown_active")

        pop_high = pop is not None and pop >= user.rain_pop_threshold
        rate_high = (
            user.rain_mm_per_h_threshold is not None
            and rain_rate is not None
            and rain_rate >= user.rain_mm_per_h_threshold
        )
        minutely_high = (
            user.rain_mm_per_h_threshold is not None
            and minutely_sum is not None
            and minutely_sum >= user.rain_mm_per_h_threshold
        )

        if pop_high or rate_high or minutely_high:
            parts: list[str] = []
            if pop_high:
                parts.append(f"pop={pop:.2f}>={user.rain_pop_threshold:.2f}")
            if rate_high:
                parts.append(f"rain_1h={rain_rate}mm/h>={user.rain_mm_per_h_threshold}")
            if minutely_high and not rate_high:
                parts.append(f"minutely60={minutely_sum}mm>={user.rain_mm_per_h_threshold}")
            return RainDecisionResult(True, "; ".join(parts) or "threshold_met")

        return RainDecisionResult(
            False,
            f"below_threshold pop={pop} rain_1h={rain_rate} minutely60={minutely_sum}",
        )
