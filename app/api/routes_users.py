from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import security
from app.api.deps import db_session_dep, get_current_user, settings_dep, verify_admin_key
from app.config import Settings
from app.db_models import User
from app.notify.email_sender import SmtpEmailSender
from app.notify.router import NotificationRouter
from app.notify.sms_sender import TwilioSmsSender
from app.repository import users as users_repo
from app.schemas import UserCreate, UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)


@router.put("/me", response_model=UserOut)
def update_me(
    body: UserUpdate,
    db: Session = Depends(db_session_dep),
    current_user: User = Depends(get_current_user),
) -> UserOut:
    u = users_repo.update_user(db, current_user.id, body)
    return UserOut.model_validate(u)


@router.post("/me/test-alert")
def send_test_alert(
    current_user: User = Depends(get_current_user),
    settings: Settings = Depends(settings_dep),
) -> dict[str, str]:
    email_sender = SmtpEmailSender(settings)
    sms_sender = TwilioSmsSender(settings)
    router = NotificationRouter(email_sender, sms_sender)

    subject = "Rain Alert Demo: Test Notification"
    body = (
        f"Hello {current_user.name}!\n\n"
        "This is a manually triggered test notification from your Smart Rain Alert system.\n"
        "Your alert settings are working correctly."
    )

    results = list(router.alert_user(current_user, subject, body))
    success = any(r.ok for _, r in results)

    if not success:
        errors = [r.error for _, r in results if not r.ok]
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send alert: {', '.join(filter(None, errors))}",
        )

    return {"message": "Test alert sent successfully"}


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
    hashed_password = security.get_password_hash(body.password)
    u = users_repo.create_user(db, body, hashed_password)
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
