# CrewWatch Frontend

Real-time astronaut health monitoring PWA for the NASA Space Apps Challenge 2026,
"The Next Frontier". Team CrewWatch: Kenya, India, Pakistan.

The frontend is pre-wired to the live CrewWatch backend and renders four views:

| Route | View | What it does |
| --- | --- | --- |
| `#/` | Home | Role selection (crew member or mission control), status legend, NASA picture of the day |
| `#/crew/:id` | Crew view | Phone-first personal status banner, plain-language guidance, numbered protocol steps, one-tap acknowledge, vital tiles with live sparklines |
| `#/control` | Mission Control | Multi-crew status grid, active alert panel with acknowledge lifecycle, event log timeline, scenario injector buttons |
| `#/report` | Mission Report | Crew status snapshot, server-generated report with PDF download, local text export |

## Tech stack

- React 18 + Vite 5
- Tailwind CSS (dark mission-control theme)
- React Router (HashRouter, deploys to any static host)
- vite-plugin-pwa (installable, offline app shell)
- WebSocket with auto-reconnect plus REST polling fallback

## Backend connection

The frontend talks to the CrewWatch FastAPI backend.

- Live base URL: `https://crewwatch-spaceapps.fastapicloud.dev`
- Local base URL: `http://localhost:8000`
- WebSocket: `wss://crewwatch-spaceapps.fastapicloud.dev/ws/mission-feed`
- API docs: `https://crewwatch-spaceapps.fastapicloud.dev/docs`

Endpoints used:

| Purpose | Method and path |
| --- | --- |
| Health check | `GET /health` |
| Live vitals and status | `GET /api/vitals/live` |
| Crew roster | `GET /api/crew` |
| Crew vitals history | `GET /api/crew/{crew_id}/vitals` |
| Alerts | `GET /api/alerts` |
| Acknowledge alert | `POST /api/alerts/{alert_id}/acknowledge` |
| Generate report | `POST /api/reports/generate` |
| Download report PDF | `GET /api/reports/{report_id}/download` |
| Inject simulator scenario | `POST /api/vitals/simulator/inject` |
| NASA picture of the day | `GET /api/nasa/apod` |
| Real-time feed | `WS /ws/mission-feed` |

All request paths live in one file: `src/config.js` under `CONFIG.ENDPOINTS`.
If any call returns 404, adjust the path there and nowhere else.

## Demo reliability

If the backend is unreachable, the app automatically switches to a seeded
simulated feed and shows a `SIMULATED FEED` banner instead of crashing.
Force this mode with `VITE_DEMO_MODE=true`.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Then open http://localhost:5173.

To run against a local backend instead, set `VITE_API_BASE_URL=http://localhost:8000`
in `.env` and start the backend from the `crewwatch-backend/backend` folder.

## Deploy to Vercel

```bash
npm run build
npx vercel deploy dist
```

Or import the repository in the Vercel dashboard. Vercel auto-detects Vite:
build command `npm run build`, output directory `dist`. Set the environment
variable `VITE_API_BASE_URL=https://crewwatch-spaceapps.fastapicloud.dev` in the
Vercel project settings for production.
