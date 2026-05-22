# DevTrackr — AI Developer Productivity Dashboard

AI developer productivity dashboard scaffolded workspace.

Folders:
- backend: Express + Mongoose API
- frontend: Vite + React dashboard

This repository contains a starter full-stack scaffold for DevTrackr —
an AI-powered developer productivity analytics dashboard.

See `backend/package.json` and `frontend/package.json` for scripts.

For detailed system architecture and working flow, see [docs/SYSTEM.md](docs/SYSTEM.md).

## Testing and CI

- Backend tests live in `backend/tests/` and run with `cd backend && npm test`.
- GitHub Actions workflow: `.github/workflows/ci-cd.yml`.
- The workflow installs backend and frontend dependencies, runs backend tests, and builds the frontend on every push and pull request.

## Performance

- Analytics and AI repo insights use an in-memory cache (`node-cache`) to reduce repeated GitHub and OpenAI requests.
