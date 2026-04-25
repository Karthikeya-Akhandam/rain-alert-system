import pytest

from app.weather.parser import parse_weather_payload


def test_parse_weather_extracts_hourly_pop():
    payload = {
        "timezone": "America/New_York",
        "hourly": {
            "time": ["2023-10-01T00:00", "2023-10-01T01:00"],
            "precipitation_probability": [70, 10],
            "precipitation": [1.2, 0.0],
            "weather_code": [61, 1]
        }
    }
    fc = parse_weather_payload(10.0, 20.0, payload)
    assert fc.next_hour_pop == 0.7
    assert fc.next_hour_rain_mm_per_h == 1.2
    assert fc.minutely_precip_sum_next_60m_mm is None
