from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class ChannelPreference(str, Enum):
    email = "email"
    sms = "sms"
    both = "both"


class WeatherPreviewQuery(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)


class HourlySliceOut(BaseModel):
    dt_unix: int
    pop: float | None
    rain_mm_per_h: float | None
    weather_main: str | None


class WeatherPreviewResponse(BaseModel):
    lat: float
    lon: float
    timezone: str | None
    next_hour_pop: float | None
    next_hour_rain_mm_per_h: float | None
    minutely_precip_sum_next_60m_mm: float | None
    hourly_next_3h: list[HourlySliceOut]


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr = Field(...)
    password: str = Field(..., min_length=8)
    phone_e164: str | None = Field(None, max_length=20)
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    rain_pop_threshold: float = Field(0.5, ge=0, le=1)
    rain_mm_per_h_threshold: float | None = Field(None, ge=0)
    cooldown_minutes: int = Field(120, ge=0, le=10080)
    channel: ChannelPreference = ChannelPreference.email


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str | None = None


class UserUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    email: EmailStr | None = None
    phone_e164: str | None = Field(None, max_length=20)
    lat: float | None = Field(None, ge=-90, le=90)
    lon: float | None = Field(None, ge=-180, le=180)
    rain_pop_threshold: float | None = Field(None, ge=0, le=1)
    rain_mm_per_h_threshold: float | None = Field(None, ge=0)
    cooldown_minutes: int | None = Field(None, ge=0, le=10080)
    channel: ChannelPreference | None = None


class UserOut(BaseModel):
    id: int
    name: str
    email: str | None
    phone_e164: str | None
    lat: float
    lon: float
    rain_pop_threshold: float
    rain_mm_per_h_threshold: float | None
    cooldown_minutes: int
    channel: ChannelPreference
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RunPreviewRequest(BaseModel):
    user_ids: list[int] | None = None


class RunPreviewUserResult(BaseModel):
    user_id: int
    name: str
    should_alert: bool
    reason: str
    next_hour_pop: float | None
    next_hour_rain_mm_per_h: float | None


class RunPreviewResponse(BaseModel):
    results: list[RunPreviewUserResult]


class RunExecuteResponse(BaseModel):
    run_id: int
    users_processed: int
    alerts_sent: int
    alerts_failed: int
    message: str


class RunSummaryOut(BaseModel):
    id: int
    started_at: datetime
    finished_at: datetime | None
    users_processed: int
    alerts_sent: int
    alerts_failed: int
    api_failures: int
    status: str

    model_config = {"from_attributes": True}


class NotificationAttemptOut(BaseModel):
    id: int
    run_id: int
    user_id: int
    channel: str
    status: str
    provider_message_id: str | None
    error: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
