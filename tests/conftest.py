import importlib
import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db_models import Base
from app.repository import db as db_mod


@pytest.fixture()
def client(monkeypatch, tmp_path):
    db_path = tmp_path / "test.db"
    url = f"sqlite:///{db_path}"
    monkeypatch.setenv("DATABASE_URL", url)
    monkeypatch.setenv("ADMIN_API_KEY", "secret-admin")
    os.environ["DATABASE_URL"] = url
    os.environ["ADMIN_API_KEY"] = "secret-admin"
    from app.config import get_settings

    get_settings.cache_clear()
    db_mod._engine = None
    db_mod._SessionLocal = None
    engine = create_engine(url, connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def _override():
        s = TestingSessionLocal()
        try:
            yield s
            s.commit()
        except Exception:
            s.rollback()
            raise
        finally:
            s.close()

    import app.main as main_mod

    importlib.reload(main_mod)
    from app.api import deps

    main_mod.app.dependency_overrides[deps.db_session_dep] = _override
    with TestClient(main_mod.app) as c:
        c.headers.update({"X-Admin-Key": "secret-admin"})
        yield c
    main_mod.app.dependency_overrides.clear()
    db_mod._engine = None
    db_mod._SessionLocal = None
