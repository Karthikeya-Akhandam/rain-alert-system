# EC2 cron example

1. Install Docker on the instance.
2. Build and run the API container, or run the app with systemd using a virtual environment.
3. Add a root crontab entry in UTC, for example every 15 minutes:

```
*/15 * * * * docker run --rm --env-file /etc/rain-alert.env your-registry/rain-alert-api:latest python -m app.cli run-job >> /var/log/rain-alert.log 2>&1
```

4. Rotate logs and monitor `/var/log/rain-alert.log` for failures.
