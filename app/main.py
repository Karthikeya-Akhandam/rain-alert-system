from __future__ import annotations

import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.deps import get_settings
from app.api.routes_health import router as health_router
from app.api.routes_metrics import router as metrics_router
from app.api.routes_runs import router as runs_router
from app.api.routes_users import router as users_router
from app.api.routes_weather import router as weather_router
from app.utils.logging import configure_logging

settings = get_settings()
configure_logging(settings)

app = FastAPI(title="Smart Rain Alert", version="0.1.0")

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = rid
    response = await call_next(request)
    response.headers["X-Request-ID"] = rid
    return response


app.include_router(health_router)
app.include_router(weather_router)
app.include_router(users_router)
app.include_router(runs_router)
app.include_router(metrics_router)
