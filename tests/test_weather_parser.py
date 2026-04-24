import pytest

from app.weather.parser import parse_onecall_payload


def test_parse_onecall_extracts_hourly_pop():
    payload = {
        "timezone": "America/New_York",
        "hourly": [
            {"dt": 1, "pop": 0.7, "weather": [{"main": "Rain"}], "rain": {"1h": 1.2}},
            {"dt": 2, "pop": 0.1, "weather": [{"main": "Clear"}]},
        ],
        "minutely": [{"dt": i, "precipitation": 0.1} for i in range(60)],
    }
    fc = parse_onecall_payload(10.0, 20.0, payload)
    assert fc.next_hour_pop == 0.7
    assert fc.next_hour_rain_mm_per_h == 1.2
    assert fc.minutely_precip_sum_next_60m_mm == pytest.approx(6.0)
