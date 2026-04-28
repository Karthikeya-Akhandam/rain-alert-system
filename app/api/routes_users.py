from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import security
from app.api.deps import db_session_dep, get_current_user, get_current_admin_user, settings_dep
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
    # Explicitly prevent non-admins from making themselves admins if they try to hack the payload
    # Though UserUpdate schema should ideally not have is_admin, or we ignore it here.
    u = users_repo.update_user(db, current_user.id, body)
    return UserOut.model_validate(u)


@router.post("/{user_id}/test-alert")
def admin_send_test_alert(
    user_id: int,
    db: Session = Depends(db_session_dep),
    current_admin: User = Depends(get_current_admin_user),
    settings: Settings = Depends(settings_dep),
) -> dict[str, str]:
    target_user = users_repo.get_user(db, user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    email_sender = SmtpEmailSender(settings)
    sms_sender = TwilioSmsSender(settings)
    router_inst = NotificationRouter(email_sender, sms_sender)

    subject = "Rain Alert Demo: Admin Test Notification"
    body = (
        f"Hello {target_user.name}!\n\n"
        "Your Smart Rain Alert system is working correctly. This test was triggered by an administrator."
    )

    results = list(router_inst.alert_user(target_user, subject, body))
    success = any(r.ok for _, r in results)

    if not success:
        errors = [r.error for _, r in results if not r.ok]
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send alert: {', '.join(filter(None, errors))}",
        )

    return {"message": f"Test alert sent to {target_user.name}"}


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
def admin_list_users(
    db: Session = Depends(db_session_dep),
    _: User = Depends(get_current_admin_user),
) -> list[UserOut]:
    return users_repo.list_users(db)


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def admin_create_user(
    body: UserCreate,
    db: Session = Depends(db_session_dep),
    _: User = Depends(get_current_admin_user),
) -> UserOut:
    _validate_contacts(body)
    hashed_password = security.get_password_hash(body.password)
    u = users_repo.create_user(db, body, hashed_password)
    return UserOut.model_validate(u)


@router.put("/{user_id}", response_model=UserOut)
def admin_update_user(
    user_id: int,
    body: UserUpdate,
    db: Session = Depends(db_session_dep),
    _: User = Depends(get_current_admin_user),
) -> UserOut:
    u = users_repo.update_user(db, user_id, body)
    if not u:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
    return UserOut.model_validate(u)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_user(
    user_id: int,
    db: Session = Depends(db_session_dep),
    _: User = Depends(get_current_admin_user),
) -> None:
    if not users_repo.delete_user(db, user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
