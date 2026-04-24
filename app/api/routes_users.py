from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import db_session_dep, verify_admin_key
from app.repository import users as users_repo
from app.schemas import UserCreate, UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


def _validate_contacts(data: UserCreate) -> None:
    if data.channel.value in ("email", "both") and not data.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="email required for email or both channel",
        )
    if data.channel.value in ("sms", "both") and not data.phone_e164:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="phone_e164 required for sms or both channel",
        )


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(db_session_dep),
    _: None = Depends(verify_admin_key),
) -> list[UserOut]:
    return users_repo.list_users(db)


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    body: UserCreate,
    db: Session = Depends(db_session_dep),
    _: None = Depends(verify_admin_key),
) -> UserOut:
    _validate_contacts(body)
    u = users_repo.create_user(db, body)
    return UserOut.model_validate(u)


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    body: UserUpdate,
    db: Session = Depends(db_session_dep),
    _: None = Depends(verify_admin_key),
) -> UserOut:
    u = users_repo.update_user(db, user_id, body)
    if not u:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
    return UserOut.model_validate(u)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(db_session_dep),
    _: None = Depends(verify_admin_key),
) -> None:
    if not users_repo.delete_user(db, user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
