import { useState, useEffect } from "react";
import type { Activity, Exercise, WorkoutPlan, PlannedExercise } from "../api";
import { fetchActivities, fetchExercises, createWorkoutPlan } from "../api";

interface WorkoutPlannerProps {
  onPlanCreated?: (plan: WorkoutPlan) => void;
  onCancel?: () => void;
}

function WorkoutPlanner({ onPlanCreated, onCancel }: WorkoutPlannerProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [planName, setPlanName] = useState("");
  const [description, setDescription] = useState("");
  const [plannedExercises, setPlannedExercises] = useState<PlannedExercise[]>([]);
  const [plannedDuration, setPlannedDuration] = useState<number | undefined>();
  const [plannedDistance, setPlannedDistance] = useState<number | undefined>();
  const [distanceUnit, setDistanceUnit] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Load data on mount
  useEffect(() => {
    Promise.all([fetchActivities(), fetchExercises()]).then(([acts, exs]) => {
      setActivities(acts);
      setExercises(exs);
    });
  }, []);

  const addPlannedExercise = (exerciseName: string) => {
    setPlannedExercises([
      ...plannedExercises,
      { exercise_name: exerciseName, sets: 3, reps: 10, weight: undefined }
    ]);
  };

  const updatePlannedExercise = (index: number, updates: Partial<PlannedExercise>) => {
    const updated = [...plannedExercises];
    updated[index] = { ...updated[index], ...updates };
    setPlannedExercises(updated);
  };

  const removePlannedExercise = (index: number) => {
    setPlannedExercises(plannedExercises.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || !planName.trim()) return;

    setLoading(true);
    try {
      const plan = await createWorkoutPlan({
        name: planName.trim(),
        activity_type: selectedActivity.type,
        description: description.trim() || undefined,
        planned_exercises: plannedExercises.length > 0 ? plannedExercises : undefined,
        planned_duration_minutes: plannedDuration,
        planned_distance: plannedDistance,
        distance_unit: distanceUnit || undefined,
      });
      onPlanCreated?.(plan);
    } catch (error) {
      console.error("Failed to create workout plan:", error);
      alert("Failed to create workout plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedActivity) {
    return (
      <div className="workout-planner">
        <h2>Plan a Workout</h2>
        <p>Select the type of workout you want to plan:</p>
        <div className="activity-grid">
          {activities.map((activity) => (
            <button
              key={activity.type}
              type="button"
              className="activity-card"
              onClick={() => setSelectedActivity(activity)}
            >
              <h3>{activity.display_name}</h3>
              <p>{activity.description}</p>
            </button>
          ))}
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="workout-planner">
      <h2>Plan {selectedActivity.display_name} Workout</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="planName">Workout Plan Name</label>
          <input
            id="planName"
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="e.g., Upper Body Strength"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your workout plan..."
            rows={3}
          />
        </div>

        {selectedActivity.type === "lifting" && (
          <div className="exercises-section">
            <h3>Exercises</h3>
            <div className="exercise-selector">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addPlannedExercise(e.target.value);
                    e.target.value = "";
                  }
                }}
                defaultValue=""
              >
                <option value="">Add an exercise...</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.name}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </div>

            {plannedExercises.map((exercise, index) => (
              <div key={index} className="planned-exercise">
                <span className="exercise-name">{exercise.exercise_name}</span>
                <div className="exercise-inputs">
                  <input
                    type="number"
                    placeholder="Sets"
                    value={exercise.sets}
                    onChange={(e) => updatePlannedExercise(index, { sets: parseInt(e.target.value) || 0 })}
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    value={exercise.reps}
                    onChange={(e) => updatePlannedExercise(index, { reps: parseInt(e.target.value) || 0 })}
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Weight (lbs)"
                    value={exercise.weight || ""}
                    onChange={(e) => updatePlannedExercise(index, { weight: parseFloat(e.target.value) || undefined })}
                    min="0"
                    step="0.5"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePlannedExercise(index)}
                  className="remove-exercise"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {(selectedActivity.type === "cardio" || selectedActivity.type === "biking" || selectedActivity.type === "swim" || selectedActivity.type === "misc") && (
          <div className="goals-section">
            <h3>Goals</h3>
            <div className="goal-inputs">
              <div className="form-group">
                <label htmlFor="duration">Planned Duration (minutes)</label>
                <input
                  id="duration"
                  type="number"
                  value={plannedDuration || ""}
                  onChange={(e) => setPlannedDuration(parseInt(e.target.value) || undefined)}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="distance">Planned Distance</label>
                <div className="distance-input">
                  <input
                    id="distance"
                    type="number"
                    value={plannedDistance || ""}
                    onChange={(e) => setPlannedDistance(parseFloat(e.target.value) || undefined)}
                    min="0"
                    step="0.1"
                  />
                  <select
                    value={distanceUnit}
                    onChange={(e) => setDistanceUnit(e.target.value)}
                  >
                    <option value="">Unit</option>
                    <option value="miles">Miles</option>
                    <option value="km">Kilometers</option>
                    <option value="meters">Meters</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => setSelectedActivity(null)}
            className="back-button"
          >
            Back
          </button>
          <button type="submit" disabled={loading || !planName.trim()}>
            {loading ? "Creating..." : "Create Plan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default WorkoutPlanner;