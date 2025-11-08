# WasteShark Platform

An end-to-end system for autonomous waterway cleanup built by Theta Tau – combining a React frontend control center, a Node.js backend with MQTT + MongoDB, embedded navigation scripts for the robot, and computer-vision tooling for debris detection.

---

## Repository Structure

| Path | Description |
|------|-------------|
| `frontEnd/` | Vite + React 18 dashboard, authentication flow, robot telemetry UI, Tailwind styling, and integration layer ready for backend APIs. |
| `backEnd/` | Express server exposing REST APIs, MQTT bridges, MongoDB persistence, Docker Compose orchestration, and JWT authentication middleware. |
| `microController/` | Python scripts for Raspberry Pi / Pixhawk integration (navigation, LED tests, remote enable), along with deployment notes. |
| `ML/` | YOLOv5-based perception stack, training configs, and deployment scripts for detect-and-drive automation. |
| `hardware/` | Hardware-specific documentation and assembly notes (see folder README). |
| `TailscaleSetup.md` | Secure VPN setup instructions for remote robot connectivity. |

---

## Quick Start

### Prerequisites

- **Node.js 18+** and **npm** (frontend/backend development)
- **Docker & Docker Compose** (recommended for backend + infrastructure stack)
- **Python 3.10+** (microcontroller scripts, ML tooling)
- **MQTT client** (optional, for manual robot telemetry testing)
- **Git LFS** if you plan to version large ML weights or CAD assets

---

## Frontend (Vite + React)

The web dashboard lives in `frontEnd/` and provides authentication, robot monitoring, and admin tooling.

```bash
cd frontEnd
npm install      # install dependencies
npm run dev      # start Vite on http://localhost:5173
npm run build    # production bundle
npm run lint     # check formatting / lint rules
```

Key files:
- `src/App.jsx` – router + provider composition
- `src/context/AuthContext.jsx` – JWT storage and auth helpers
- `src/pages/Dashboard.jsx` – telemetry polling, robot controls, and layout
- `src/api/*.js` – API facades (swap mocks for backend endpoints)

Set `VITE_API_BASE_URL` in `.env` once the backend URL is known:

```bash
cp .env.example .env
echo "VITE_API_BASE_URL=http://localhost:3000" >> .env
```

---

## Backend (Express + MQTT + MongoDB)

The backend lives in `backEnd/` and exposes REST endpoints, manages JWT auth, proxies robot commands over MQTT, and persists state in MongoDB.

### Run with Docker (Recommended)

```bash
cd backEnd
cp .env.example .env         # populate Mongo + MQTT credentials
docker compose up -d         # starts backend, MongoDB, Mosquitto, Nginx (if configured)
docker compose logs -f       # follow logs
```

### Local Node.js Development

```bash
cd backEnd
npm install
docker compose up mongo mosquitto-broker -d   # spin up dependencies
npm run dev                                   # or node server.js
```

HTTP endpoints auto-load from `api/http/**`, MQTT handlers from `api/mqtt/**`, and middleware (JWT, robot ownership) resides under `middleware/`. Schemas are defined with Mongoose in `schemas/`.

---

## Microcontroller & Navigation

Scripts in `microController/` target the onboard Raspberry Pi / flight controller:

- `navigation_code.py`, `nav_barebones.py` – autonomous routing and motor control routines.
- `LED_Test_Code.py` – hardware diagnostics.
- `microcontroller_remote_enable.txt`, `raspberryIP` – deployment notes.

Most scripts assume Python 3 with access to hardware GPIO / MAVLink libraries. Review each file’s header comments before running on the robot.

---

## Machine Learning (YOLOv5)

The `ML/` directory contains a customized YOLOv5 fork for debris detection and autonomous decision making:

- `yolov5/detect*.py`, `detect_and_drive*.py` – inference pipelines, some coupled with telemetry outputs.
- `yolov5/train.py`, `data/`, `runs/` – training configs, dataset pointers, and experiment artifacts.
- `yolov5/export.py`, `hubconf.py` – model export for edge deployment.

Follow standard YOLOv5 setup (PyTorch, CUDA/cuDNN if available) and consult `ML/readMe` for environment details. Use virtual environments to avoid dependency conflicts with the frontend/backend stacks.

---

## Hardware Docs

All mechanical/electrical assembly instructions live inside `hardware/`. Refer to that folder’s `readMe` (and any PDFs/CAD files tracked elsewhere) before modifying the physical system.

---

## Development Workflow

1. Create a new branch for your feature/fix.
2. Update environment files (`.env`, `docker-compose` overrides) instead of hardcoding secrets.
3. Run relevant tests / linters:
   - `frontEnd`: `npm run lint`
   - `backEnd`: `npm test`
   - `ML`: `python -m pytest` or YOLO training dry-runs as applicable
4. Submit a pull request with a clear summary and testing evidence.

---

## Support & Communication

- Open GitHub issues for bugs or feature requests.
- Use the team’s Tailscale mesh (see `TailscaleSetup.md`) for remote hardware debugging.
- Sync with the robotics, frontend, backend, and ML subteams during weekly standups to keep interfaces aligned.

---

## License

Back-end services are currently distributed under the ISC license (see `backEnd/README.md`). Confirm licensing requirements with the project lead before publishing additional components or datasets.

---
