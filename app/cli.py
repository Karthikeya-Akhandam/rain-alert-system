from __future__ import annotations

import argparse

from app.config import get_settings
from app.repository.db import get_session_factory
from app.jobs.rain_alert_job import run_rain_alert_job
from app.utils.logging import configure_logging


def main() -> None:
    parser = argparse.ArgumentParser(description="Rain alert CLI")
    parser.add_argument("command", choices=["run-job"], help="Command to execute")
    parser.add_argument("--dry-run", action="store_true", help="Skip notifications")
    args = parser.parse_args()

    settings = get_settings()
    configure_logging(settings)
    factory = get_session_factory()
    db = factory()
    try:
        if args.command == "run-job":
            run_id, processed, sent, failed = run_rain_alert_job(
                db, settings, dry_run=args.dry_run
            )
            db.commit()
            print(f"run_id={run_id} processed={processed} sent={sent} failed={failed}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
