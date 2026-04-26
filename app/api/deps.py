from __future__ import annotations

from collections.abc import Generator

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db_models import User
from app.repository import users as users_repo
from app.repository.db import get_db_session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


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


def get_current_user(
    db: Session = Depends(db_session_dep),
    token: str = Depends(oauth2_scheme),
    settings: Settings = Depends(settings_dep),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = users_repo.get_user_by_email(db, email)
    if user is None:
        raise credentials_exception
    return user
