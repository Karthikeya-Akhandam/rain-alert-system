from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import db_session_dep, get_current_admin_user
from app.db_models import NotificationAttempt, Run, User

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("")
def metrics_summary(
    db: Session = Depends(db_session_dep),
    _: User = Depends(get_current_admin_user),
) -> dict[str, int]:
    runs_total = db.scalar(select(func.count()).select_from(Run)) or 0
    alerts_sent = (
        db.scalar(
            select(func.count())
            .select_from(NotificationAttempt)
            .where(NotificationAttempt.status == "sent")
        )
        or 0
    )
    alerts_failed = (
        db.scalar(
            select(func.count())
            .select_from(NotificationAttempt)
            .where(NotificationAttempt.status == "failed")
        )
        or 0
    )
    api_failures = db.scalar(select(func.coalesce(func.sum(Run.api_failures), 0))) or 0
    users_processed = db.scalar(select(func.coalesce(func.sum(Run.users_processed), 0))) or 0
    return {
        "runs_total": int(runs_total),
        "users_processed_total": int(users_processed),
        "alerts_sent": int(alerts_sent),
        "alerts_failed": int(alerts_failed),
        "api_failures_total": int(api_failures),
    }
