# Production checklist

- Store `OPENWEATHER_API_KEY`, `ADMIN_API_KEY`, SMTP and Twilio secrets only in the platform secret manager or environment variables.
- Set `ADMIN_API_KEY` in production so `/users`, `/runs`, and `/metrics` require `X-Admin-Key`.
- Configure `CORS_ORIGINS` to the deployed frontend origin.
- Enable `SMTP_ENABLED` and verify SPF, DKIM, and DMARC for the sending domain before go-live.
- If using SMS, enable `SMS_ENABLED` and validate Twilio sender configuration.
- Use a persistent database URL (for example Postgres) instead of ephemeral SQLite for multi-instance APIs.
- Schedule the job with a platform cron (for example Render Cron Job) calling `python -m app.cli run-job`.
- Monitor `GET /metrics` and application logs for failed sends and weather API errors.
