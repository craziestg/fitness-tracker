import { useState, useEffect } from "react";
import type { WorkoutPlan, WorkoutSession, WorkoutCompletionRequest } from "../api";
import { fetchWorkoutPlans, createWorkout, completeWorkout } from "../api";

interface WorkoutTrackerProps {
  onWorkoutCompleted?: (session: WorkoutSession) => void;
  onCancel?: () => void;
}

function WorkoutTracker({ onWorkoutCompleted, onCancel }: WorkoutTrackerProps) {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (startTime && !currentWorkout?.finished_at) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, currentWorkout?.finished_at]);

  // Load plans on mount
  useEffect(() => {
    fetchWorkoutPlans().then(setPlans).catch(console.error);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const session = await createWorkout({ plan_id: selectedPlan.id });
      setCurrentWorkout(session);
      setStartTime(new Date());
    } catch (error) {
      console.error("Failed to start workout:", error);
      alert("Failed to start workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const finishWorkout = () => {
    setShowCompletion(true);
  };

  const submitCompletion = async (completion: WorkoutCompletionRequest) => {
    if (!currentWorkout) return;

    setLoading(true);
    try {
      const updatedSession = await completeWorkout(currentWorkout.id, completion);
      setCurrentWorkout(updatedSession);
      setShowCompletion(false);
      onWorkoutCompleted?.(updatedSession);
    } catch (error) {
      console.error("Failed to complete workout:", error);
      alert("Failed to complete workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showCompletion && currentWorkout) {
    return (
      <div className="workout-completion">
        <h2>Workout Complete! 🎉</h2>
        <p>You finished your {selectedPlan?.name} workout!</p>

        <CompletionForm
          onSubmit={submitCompletion}
          onCancel={() => setShowCompletion(false)}
          loading={loading}
          activityType={currentWorkout.activity_type}
        />
      </div>
    );
  }

  if (currentWorkout && !currentWorkout.finished_at) {
    return (
      <div className="workout-tracker active">
        <div className="workout-header">
          <h2>{selectedPlan?.name}</h2>
          <div className="timer">{formatTime(elapsedTime)}</div>
        </div>

        <div className="workout-content">
          {currentWorkout.activity_type === "lifting" && currentWorkout.planned_exercises && (
            <div className="lifting-checklist">
              <h3>Exercise Checklist</h3>
              {currentWorkout.planned_exercises.map((exercise, index) => (
                <div key={index} className="exercise-item">
                  <label className="exercise-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    <span className="exercise-details">
                      {exercise.exercise_name}: {exercise.sets} sets × {exercise.reps} reps
                      {exercise.weight && ` @ ${exercise.weight} lbs`}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {(currentWorkout.activity_type === "cardio" || currentWorkout.activity_type === "biking" || currentWorkout.activity_type === "swim") && (
            <div className="cardio-tracker">
              <h3>Activity in Progress</h3>
              <div className="activity-info">
                {currentWorkout.planned_duration_minutes && (
                  <p>Planned: {currentWorkout.planned_duration_minutes} minutes</p>
                )}
                {currentWorkout.planned_distance && (
                  <p>Goal: {currentWorkout.planned_distance} {currentWorkout.distance_unit}</p>
                )}
              </div>
            </div>
          )}

          {currentWorkout.activity_type === "misc" && (
            <div className="misc-tracker">
              <h3>Miscellaneous Activity</h3>
              <p>Track your miscellaneous workout activities here.</p>
            </div>
          )}
        </div>

        <div className="workout-actions">
          <button
            type="button"
            onClick={finishWorkout}
            className="finish-workout-button"
          >
            Finish Workout
          </button>
        </div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="workout-tracker">
        <h2>Start a Workout</h2>
        <p>Select a workout plan to begin:</p>

        <div className="plans-grid">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className="plan-card"
              onClick={() => setSelectedPlan(plan)}
            >
              <h3>{plan.name}</h3>
              <p>{plan.activity_type.replace(/^[a-z]/, (char) => char.toUpperCase())}</p>
              {plan.description && <p className="plan-description">{plan.description}</p>}
              <div className="plan-details">
                {plan.planned_exercises && (
                  <span>{plan.planned_exercises.length} exercises</span>
                )}
                {plan.planned_duration_minutes && (
                  <span>{plan.planned_duration_minutes} min</span>
                )}
                {plan.planned_distance && (
                  <span>{plan.planned_distance} {plan.distance_unit}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {plans.length === 0 && (
          <div className="no-plans">
            <p>No workout plans found. Create a plan first!</p>
          </div>
        )}

        {onCancel && (
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="workout-tracker">
      <h2>Ready to Start: {selectedPlan.name}</h2>

      <div className="plan-preview">
        <p><strong>Type:</strong> {selectedPlan.activity_type.replace(/^[a-z]/, (char) => char.toUpperCase())}</p>
        {selectedPlan.description && <p><strong>Description:</strong> {selectedPlan.description}</p>}

        {selectedPlan.planned_exercises && selectedPlan.planned_exercises.length > 0 && (
          <div className="exercises-preview">
            <h3>Exercises:</h3>
            <ul>
              {selectedPlan.planned_exercises.map((exercise, index) => (
                <li key={index}>
                  {exercise.exercise_name}: {exercise.sets} sets × {exercise.reps} reps
                  {exercise.weight && ` @ ${exercise.weight} lbs`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedPlan.planned_duration_minutes && (
          <p><strong>Duration:</strong> {selectedPlan.planned_duration_minutes} minutes</p>
        )}

        {selectedPlan.planned_distance && (
          <p><strong>Distance:</strong> {selectedPlan.planned_distance} {selectedPlan.distance_unit}</p>
        )}
      </div>

      <div className="workout-actions">
        <button
          type="button"
          onClick={() => setSelectedPlan(null)}
          className="back-button"
        >
          Back
        </button>
        <button
          type="button"
          onClick={startWorkout}
          disabled={loading}
          className="start-workout-button"
        >
          {loading ? "Starting..." : "Start Workout"}
        </button>
      </div>
    </div>
  );
}

interface CompletionFormProps {
  onSubmit: (completion: WorkoutCompletionRequest) => void;
  onCancel: () => void;
  loading: boolean;
  activityType: string;
}

function CompletionForm({ onSubmit, onCancel, loading, activityType }: CompletionFormProps) {
  const [overallFeeling, setOverallFeeling] = useState("");
  const [favoritePart, setFavoritePart] = useState("");
  const [actualDuration, setActualDuration] = useState<number | undefined>();
  const [actualDistance, setActualDistance] = useState<number | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overallFeeling) return;

    onSubmit({
      overall_feeling: overallFeeling,
      favorite_part: favoritePart || undefined,
      actual_duration_minutes: actualDuration,
      actual_distance: actualDistance,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="completion-form">
      <div className="form-group">
        <label htmlFor="feeling">How did you feel overall?</label>
        <select
          id="feeling"
          value={overallFeeling}
          onChange={(e) => setOverallFeeling(e.target.value)}
          required
        >
          <option value="">Select feeling...</option>
          <option value="great">Great! 💪</option>
          <option value="good">Good 👍</option>
          <option value="okay">Okay 😐</option>
          <option value="tough">Tough 😅</option>
          <option value="terrible">Terrible 😩</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="favorite">What was your favorite part? (optional)</label>
        <textarea
          id="favorite"
          value={favoritePart}
          onChange={(e) => setFavoritePart(e.target.value)}
          placeholder="What did you enjoy most about this workout?"
          rows={3}
        />
      </div>

      {(activityType === "cardio" || activityType === "biking" || activityType === "swim" || activityType === "misc") && (
        <>
          <div className="form-group">
            <label htmlFor="actualDuration">Actual Duration (minutes)</label>
            <input
              id="actualDuration"
              type="number"
              value={actualDuration || ""}
              onChange={(e) => setActualDuration(parseInt(e.target.value) || undefined)}
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="actualDistance">Actual Distance</label>
            <input
              id="actualDistance"
              type="number"
              value={actualDistance || ""}
              onChange={(e) => setActualDistance(parseFloat(e.target.value) || undefined)}
              min="0"
              step="0.1"
            />
          </div>
        </>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={loading}>
          Back
        </button>
        <button type="submit" disabled={loading || !overallFeeling}>
          {loading ? "Saving..." : "Complete Workout"}
        </button>
      </div>
    </form>
  );
}

export default WorkoutTracker;