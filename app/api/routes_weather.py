from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import settings_dep
from app.config import Settings
from app.schemas import HourlySliceOut, WeatherPreviewQuery, WeatherPreviewResponse
from app.weather.client import OpenWeatherClient, OpenWeatherError

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/preview", response_model=WeatherPreviewResponse)
def weather_preview(
    lat: float,
    lon: float,
    settings: Settings = Depends(settings_dep),
) -> WeatherPreviewResponse:
    q = WeatherPreviewQuery(lat=lat, lon=lon)
    client = OpenWeatherClient(settings)
    try:
        fc = client.forecast_for_coordinates(q.lat, q.lon)
    except OpenWeatherError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    finally:
        client.close()
    return WeatherPreviewResponse(
        lat=fc.lat,
        lon=fc.lon,
        timezone=fc.timezone,
        next_hour_pop=fc.next_hour_pop,
        next_hour_rain_mm_per_h=fc.next_hour_rain_mm_per_h,
        minutely_precip_sum_next_60m_mm=fc.minutely_precip_sum_next_60m_mm,
        hourly_next_3h=[
            HourlySliceOut(
                dt_unix=h.dt_unix,
                pop=h.pop,
                rain_mm_per_h=h.rain_mm_per_h,
                weather_main=h.weather_main,
            )
            for h in fc.hourly_next_3h
        ],
    )
