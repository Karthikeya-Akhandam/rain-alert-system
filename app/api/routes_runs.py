from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import db_session_dep, settings_dep, verify_admin_key
from app.config import Settings
from app.decision.engine import RainDecisionEngine
from app.jobs.rain_alert_job import run_rain_alert_job
from app.repository import history as history_repo
from app.repository import users as users_repo
from app.schemas import (
    NotificationAttemptOut,
    RunExecuteResponse,
    RunPreviewRequest,
    RunPreviewResponse,
    RunPreviewUserResult,
    RunSummaryOut,
)
from app.weather.client import OpenWeatherClient, OpenWeatherError

router = APIRouter(prefix="/runs", tags=["runs"])


@router.post("/preview", response_model=RunPreviewResponse)
def preview_run(
    body: RunPreviewRequest,
    db: Session = Depends(db_session_dep),
    settings: Settings = Depends(settings_dep),
    _: None = Depends(verify_admin_key),
) -> RunPreviewResponse:
    users = users_repo.list_users(db)
    if body.user_ids:
        wanted = set(body.user_ids)
        users = [u for u in users if u.id in wanted]
    client = OpenWeatherClient(settings)
    engine = RainDecisionEngine()
    results: list[RunPreviewUserResult] = []
    try:
        for u in users:
            try:
                fc = client.forecast_for_coordinates(u.lat, u.lon)
            except OpenWeatherError as exc:
                results.append(
                    RunPreviewUserResult(
                        user_id=u.id,
                        name=u.name,
                        should_alert=False,
                        reason=f"weather_error:{exc}",
                        next_hour_pop=None,
                        next_hour_rain_mm_per_h=None,
                    )
                )
                continue
            d = engine.evaluate(u, fc)
            results.append(
                RunPreviewUserResult(
                    user_id=u.id,
                    name=u.name,
                    should_alert=d.should_alert,
                    reason=d.reason,
                    next_hour_pop=fc.next_hour_pop,
                    next_hour_rain_mm_per_h=fc.next_hour_rain_mm_per_h,
                )
            )
    finally:
        client.close()
    return RunPreviewResponse(results=results)


@router.post("/execute", response_model=RunExecuteResponse)
def execute_run(
    db: Session = Depends(db_session_dep),
    settings: Settings = Depends(settings_dep),
    _: None = Depends(verify_admin_key),
) -> RunExecuteResponse:
    run_id, processed, sent, failed = run_rain_alert_job(db, settings, dry_run=False)
    return RunExecuteResponse(
        run_id=run_id,
        users_processed=processed,
        alerts_sent=sent,
        alerts_failed=failed,
        message="Run completed",
    )


@router.get("", response_model=list[RunSummaryOut])
def list_runs(
    db: Session = Depends(db_session_dep),
    _: None = Depends(verify_admin_key),
) -> list[RunSummaryOut]:
    runs = history_repo.list_runs(db, limit=50)
    return [RunSummaryOut.model_validate(r) for r in runs]


@router.get("/{run_id}/notifications", response_model=list[NotificationAttemptOut])
def list_run_notifications(
    run_id: int,
    db: Session = Depends(db_session_dep),
    _: None = Depends(verify_admin_key),
) -> list[NotificationAttemptOut]:
    if history_repo.get_run(db, run_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="run not found")
    rows = history_repo.list_notifications_for_run(db, run_id)
    return [NotificationAttemptOut.model_validate(n) for n in rows]
