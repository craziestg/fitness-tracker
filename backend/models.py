from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator


class ActivityType(str, Enum):
    LIFTING = "lifting"
    CARDIO = "cardio"
    BIKING = "biking"
    SWIM = "swim"
    MISC = "misc"


class Activity(BaseModel):
    type: ActivityType
    display_name: str
    description: Optional[str] = None


class Exercise(BaseModel):
    id: str
    name: str
    primary_muscle_group: Optional[str] = None
    default_weight: Optional[float] = None
    notes: Optional[str] = None


class PlannedExercise(BaseModel):
    exercise_name: str
    sets: int
    reps: int
    weight: Optional[float] = None


class WorkoutPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    activity_type: ActivityType
    description: Optional[str] = None
    planned_exercises: Optional[List[PlannedExercise]] = None
    planned_duration_minutes: Optional[int] = None
    planned_distance: Optional[float] = None
    distance_unit: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")

    @validator("distance_unit")
    def normalize_distance_unit(cls, value: Optional[str]) -> Optional[str]:
        if value:
            return value.lower()
        return value
class WorkoutStartRequest(BaseModel):
    plan_id: Optional[str] = None  # Optional for backward compatibility


class SetLog(BaseModel):
    set_index: int
    weight: float
    reps: int
    felt: str = Field(..., description="How the set felt: easy, ok, hard")
    completed: bool = True


class WorkoutSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    plan_id: Optional[str] = None  # Optional for backward compatibility
    activity_type: ActivityType
    started_at: str
    finished_at: Optional[str] = None
    planned_exercises: Optional[List[PlannedExercise]] = None
    planned_duration_minutes: Optional[int] = None
    planned_distance: Optional[float] = None
    distance_unit: Optional[str] = None
    notes: Optional[str] = None
    set_logs: Optional[List[SetLog]] = None
    # Completion tracking
    overall_feeling: Optional[str] = None  # "great", "good", "okay", "tough", "terrible"
    favorite_part: Optional[str] = None
    actual_duration_minutes: Optional[int] = None
    actual_distance: Optional[float] = None


class WorkoutCompletionRequest(BaseModel):
    overall_feeling: str = Field(..., description="How you felt overall: great, good, okay, tough, terrible")
    favorite_part: Optional[str] = None
    actual_duration_minutes: Optional[int] = None
    actual_distance: Optional[float] = None
