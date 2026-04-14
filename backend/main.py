from datetime import datetime
from typing import List
import os
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import Activity, ActivityType, Exercise, WorkoutSession, WorkoutStartRequest, WorkoutPlan, WorkoutCompletionRequest
from storage import load_exercises, load_workouts, save_exercises, save_workouts, load_workout_plans, save_workout_plans

# Load environment variables from .env file (local development)
load_dotenv()

app = FastAPI(title="Fitness Tracker API", version="0.1")

# Configure CORS based on environment
# For local development: allow localhost
# For Azure: allow the Static Web Apps domain
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5174,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

activities = [
    Activity(type=ActivityType.LIFTING, display_name="Lifting", description="Weight training with sets and reps."),
    Activity(type=ActivityType.CARDIO, display_name="Cardio", description="Running, rowing, or treadmill work."),
    Activity(type=ActivityType.BIKING, display_name="Biking", description="Outdoor or indoor cycling."),
    Activity(type=ActivityType.SWIM, display_name="Swim", description="Pool or open-water swimming."),
    Activity(type=ActivityType.MISC, display_name="Misc", description="Other workouts or active recovery."),
]


def _get_display_name(activity_type: ActivityType) -> str:
    return next((activity.display_name for activity in activities if activity.type == activity_type), activity_type.value.title())


@app.get("/api/activities", response_model=List[Activity])
async def list_activities():
    return activities


@app.get("/api/exercises", response_model=List[Exercise])
async def list_exercises():
    return [Exercise(**item) for item in load_exercises()]


@app.post("/api/exercises", response_model=Exercise)
async def create_exercise(exercise: Exercise):
    existing = load_exercises()
    if any(item["id"] == exercise.id for item in existing):
        raise HTTPException(status_code=400, detail="Exercise already exists")
    existing.append(exercise.dict())
    save_exercises(existing)
    return exercise


# Workout Plan endpoints
@app.get("/api/workout-plans", response_model=List[WorkoutPlan])
async def list_workout_plans():
    return [WorkoutPlan(**item) for item in load_workout_plans()]


@app.post("/api/workout-plans", response_model=WorkoutPlan)
async def create_workout_plan(plan: WorkoutPlan):
    existing = load_workout_plans()
    if any(item["id"] == plan.id for item in existing):
        raise HTTPException(status_code=400, detail="Workout plan already exists")
    existing.append(plan.dict())
    save_workout_plans(existing)
    return plan


@app.get("/api/workout-plans/{plan_id}", response_model=WorkoutPlan)
async def get_workout_plan(plan_id: str):
    plans = load_workout_plans()
    plan_data = next((item for item in plans if item["id"] == plan_id), None)
    if not plan_data:
        raise HTTPException(status_code=404, detail="Workout plan not found")
    return WorkoutPlan(**plan_data)


@app.put("/api/workout-plans/{plan_id}", response_model=WorkoutPlan)
async def update_workout_plan(plan_id: str, plan: WorkoutPlan):
    existing = load_workout_plans()
    for i, item in enumerate(existing):
        if item["id"] == plan_id:
            updated_plan = plan.dict()
            updated_plan["id"] = plan_id
            updated_plan["updated_at"] = datetime.utcnow().isoformat() + "Z"
            existing[i] = updated_plan
            save_workout_plans(existing)
            return WorkoutPlan(**updated_plan)
    raise HTTPException(status_code=404, detail="Workout plan not found")


@app.delete("/api/workout-plans/{plan_id}")
async def delete_workout_plan(plan_id: str):
    existing = load_workout_plans()
    filtered = [item for item in existing if item["id"] != plan_id]
    if len(filtered) == len(existing):
        raise HTTPException(status_code=404, detail="Workout plan not found")
    save_workout_plans(filtered)
    return {"message": "Workout plan deleted"}


@app.get("/api/workouts", response_model=List[WorkoutSession])
async def list_workouts():
    return [WorkoutSession(**item) for item in load_workouts()]


@app.post("/api/workouts/start", response_model=WorkoutSession)
async def start_workout(payload: WorkoutStartRequest):
    if not payload.plan_id:
        raise HTTPException(status_code=400, detail="plan_id is required")

    # Load the workout plan
    plans = load_workout_plans()
    plan_data = next((item for item in plans if item["id"] == payload.plan_id), None)
    if not plan_data:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    plan = WorkoutPlan(**plan_data)
    workouts = load_workouts()

    session = WorkoutSession(
        plan_id=payload.plan_id,
        activity_type=plan.activity_type,
        started_at=datetime.utcnow().isoformat() + "Z",
        planned_exercises=plan.planned_exercises,
        planned_duration_minutes=plan.planned_duration_minutes,
        planned_distance=plan.planned_distance,
        distance_unit=plan.distance_unit,
        notes=plan.description,
    )
    workouts.append(session.dict())
    save_workouts(workouts)
    return session


@app.post("/api/workouts/{workout_id}/complete", response_model=WorkoutSession)
async def complete_workout(workout_id: str, completion: WorkoutCompletionRequest):
    workouts = load_workouts()
    for i, item in enumerate(workouts):
        if item["id"] == workout_id:
            item["finished_at"] = datetime.utcnow().isoformat() + "Z"
            item["overall_feeling"] = completion.overall_feeling
            item["favorite_part"] = completion.favorite_part
            item["actual_duration_minutes"] = completion.actual_duration_minutes
            item["actual_distance"] = completion.actual_distance
            save_workouts(workouts)
            return WorkoutSession(**item)
    raise HTTPException(status_code=404, detail="Workout session not found")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
