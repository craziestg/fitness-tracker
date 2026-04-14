// Environment-aware API base URL
// For development: uses Vite proxy to http://127.0.0.1:8000
// For production: uses Azure App Service URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export type Activity = {
  type: string;
  display_name: string;
  description?: string;
};

export type Exercise = {
  id: string;
  name: string;
  primary_muscle_group?: string;
  default_weight?: number;
  notes?: string;
};

export type PlannedExercise = {
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: number;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  activity_type: string;
  description?: string;
  planned_exercises?: PlannedExercise[];
  planned_duration_minutes?: number;
  planned_distance?: number;
  distance_unit?: string;
  created_at: string;
  updated_at: string;
};

export type WorkoutStartRequest = {
  plan_id?: string;
};

export type WorkoutCompletionRequest = {
  overall_feeling: string;
  favorite_part?: string;
  actual_duration_minutes?: number;
  actual_distance?: number;
};

export type WorkoutSession = {
  id: string;
  plan_id?: string;
  activity_type: string;
  started_at: string;
  finished_at?: string;
  planned_exercises?: PlannedExercise[];
  planned_duration_minutes?: number;
  planned_distance?: number;
  distance_unit?: string;
  notes?: string;
  overall_feeling?: string;
  favorite_part?: string;
  actual_duration_minutes?: number;
  actual_distance?: number;
};

export async function fetchActivities(): Promise<Activity[]> {
  const response = await fetch(`${API_BASE_URL}/api/activities`);
  if (!response.ok) {
    throw new Error("Failed to load activities");
  }
  return response.json();
}

export async function fetchWorkouts(): Promise<WorkoutSession[]> {
  const response = await fetch(`${API_BASE_URL}/api/workouts`);
  if (!response.ok) {
    throw new Error("Failed to load workouts");
  }
  return response.json();
}

export async function fetchExercises(): Promise<Exercise[]> {
  const response = await fetch(`${API_BASE_URL}/api/exercises`);
  if (!response.ok) {
    throw new Error("Failed to load exercises");
  }
  return response.json();
}

export async function createExercise(exercise: Omit<Exercise, "id">): Promise<Exercise> {
  const response = await fetch(`${API_BASE_URL}/api/exercises`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...exercise, id: crypto.randomUUID() }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to create exercise");
  }
  return response.json();
}

export async function createWorkout(
  workout: WorkoutStartRequest
): Promise<WorkoutSession> {
  const response = await fetch(`${API_BASE_URL}/api/workouts/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workout),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to create workout");
  }
  return response.json();
}

// Workout Plan API functions
export async function fetchWorkoutPlans(): Promise<WorkoutPlan[]> {
  const response = await fetch(`${API_BASE_URL}/api/workout-plans`);
  if (!response.ok) {
    throw new Error("Failed to load workout plans");
  }
  return response.json();
}

export async function createWorkoutPlan(plan: Omit<WorkoutPlan, "id" | "created_at" | "updated_at">): Promise<WorkoutPlan> {
  const response = await fetch(`${API_BASE_URL}/api/workout-plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...plan, id: crypto.randomUUID() }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to create workout plan");
  }
  return response.json();
}

export async function updateWorkoutPlan(planId: string, plan: Omit<WorkoutPlan, "id" | "created_at" | "updated_at">): Promise<WorkoutPlan> {
  const response = await fetch(`${API_BASE_URL}/api/workout-plans/${planId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(plan),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to update workout plan");
  }
  return response.json();
}

export async function deleteWorkoutPlan(planId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/workout-plans/${planId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete workout plan");
  }
}

// Workout completion API function
export async function completeWorkout(workoutId: string, completion: WorkoutCompletionRequest): Promise<WorkoutSession> {
  const response = await fetch(`${API_BASE_URL}/api/workouts/${workoutId}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(completion),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to complete workout");
  }
  return response.json();
}
