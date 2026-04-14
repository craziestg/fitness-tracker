# Fitness Tracker

A lightweight workout planner with a FastAPI backend and React + Vite frontend.

## Requirements

- Python 3.11+ (or later)
- Node.js / npm for the frontend

## Backend Setup

```powershell
cd fitness_tracker\backend
python -m venv .venv
.venv\Scripts\Activate
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

The backend runs on `http://127.0.0.1:8000`.

## Frontend Setup

```powershell
cd fitness_tracker\frontend
npm install
npm run dev
```

The frontend runs on `http://127.0.0.1:5173` and proxies `/api` requests to the backend.

## Available APIs

- `GET /api/activities`
- `GET /api/exercises`
- `POST /api/exercises`
- `GET /api/workouts`
- `POST /api/workouts/start`

## Notes

- `GET /api/activities` returns the activity types used in the planner.
- The first UI flow lets you select an activity and create a workout plan.
- Node.js is required to run the frontend; it is not installed in the current environment.
