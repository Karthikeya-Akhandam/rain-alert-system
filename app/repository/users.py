from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db_models import User
from app.schemas import UserCreate, UserUpdate


def list_users(db: Session) -> list[User]:
    return list(db.scalars(select(User).order_by(User.id)))


def get_user(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def create_user(db: Session, data: UserCreate, hashed_password: str) -> User:
    is_first = db.scalar(select(func.count(User.id))) == 0
    u = User(
        name=data.name,
        email=str(data.email) if data.email else None,
        hashed_password=hashed_password,
        is_admin=is_first,
        phone_e164=data.phone_e164,
        lat=data.lat,
        lon=data.lon,
        rain_pop_threshold=data.rain_pop_threshold,
        rain_mm_per_h_threshold=data.rain_mm_per_h_threshold,
        cooldown_minutes=data.cooldown_minutes,
        channel=data.channel.value,
    )
    db.add(u)
    db.flush()
    return u


def update_user(db: Session, user_id: int, data: UserUpdate) -> User | None:
    u = get_user(db, user_id)
    if not u:
        return None
    payload = data.model_dump(exclude_unset=True)
    if "channel" in payload and payload["channel"] is not None:
        payload["channel"] = payload["channel"].value
    if "email" in payload and payload["email"] is not None:
        payload["email"] = str(payload["email"])
    for k, v in payload.items():
        setattr(u, k, v)
    u.updated_at = datetime.now(timezone.utc)
    db.flush()
    return u


def delete_user(db: Session, user_id: int) -> bool:
    u = get_user(db, user_id)
    if not u:
        return False
    db.delete(u)
    return True


def mark_last_alert(db: Session, user_id: int, at: datetime | None = None) -> None:
    u = get_user(db, user_id)
    if u:
        u.last_alert_at = at or datetime.now(timezone.utc)
        db.flush()
