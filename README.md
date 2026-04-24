# Smart Rain Alert

Backend service and web UI that check OpenWeather One Call 3.0 forecasts for registered coordinates and send email or SMS alerts when rain is likely soon.

## Requirements

- Python 3.11+
- Node 20+ (for the frontend)
- OpenWeather API key with One Call 3.0 access

## Local development

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# set OPENWEATHER_API_KEY and optional ADMIN_API_KEY
uvicorn app.main:app --reload --port 8000
```

Frontend (proxies API paths to port 8000 when using `npm run dev`):

```powershell
cd frontend
npm install
npm run dev
```

Run the batch job once:

```powershell
python -m app.cli run-job
```

Dry run (no notifications):

```powershell
python -m app.cli run-job --dry-run
```

## Tests

```powershell
pytest tests -q
cd frontend
npm test
```

## Docker

```powershell
docker compose up --build
```

API listens on `http://localhost:8000`.

## Deployment notes

See [deploy/production-checklist.md](deploy/production-checklist.md) and [deploy/ec2-cron.md](deploy/ec2-cron.md). Render blueprint example: [render.yaml](render.yaml).

## SDG framing

See [docs/sdg-impact.md](docs/sdg-impact.md).
