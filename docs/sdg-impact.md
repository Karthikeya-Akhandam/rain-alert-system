# SDG alignment

This project supports **SDG 11 (Sustainable Cities)** and **SDG 13 (Climate Action)** by providing short-horizon precipitation awareness for urban residents and operations teams.

## Mechanism

- Hyperlocal coordinates and transparent thresholds reduce surprise rainfall impacts on travel, outdoor work, and drainage-sensitive areas.
- Auditable notification attempts (`notification_attempts`) support accountability and post-event review.

## Example metrics to report academically

- `runs_total` and `alerts_sent` from `GET /metrics` over a pilot window.
- Reduction in repeated alerts per user via cooldown configuration.

## Architecture reference

See the diagram in the project plan: frontend to API for configuration, scheduled job for batch evaluation, external weather and messaging providers.
