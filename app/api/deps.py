from __future__ import annotations

from collections.abc import Generator

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.repository.db import get_db_session


def settings_dep() -> Settings:
    return get_settings()


def db_session_dep() -> Generator[Session, None, None]:
    yield from get_db_session()


def verify_admin_key(
    request: Request,
    settings: Settings = Depends(settings_dep),
) -> None:
    if not settings.admin_api_key:
        return
    key = request.headers.get("X-Admin-Key")
    if key != settings.admin_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin key")
