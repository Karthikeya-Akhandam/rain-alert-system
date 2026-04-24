from app.config import Settings


def test_settings_reads_env(monkeypatch):
    monkeypatch.setenv("OPENWEATHER_API_KEY", "abc")
    monkeypatch.setenv("LOG_LEVEL", "DEBUG")
    s = Settings()
    assert s.openweather_api_key == "abc"
    assert s.log_level == "DEBUG"
