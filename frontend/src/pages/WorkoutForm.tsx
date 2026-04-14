import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createExercise, createWorkout, Exercise, fetchExercises, PlannedExercise, WorkoutSession } from "../api";

type WorkoutFormProps = {
  activityType: string;
  onSuccess: (session: WorkoutSession) => void;
  onCancel: () => void;
};

export default function WorkoutForm({ activityType, onSuccess, onCancel }: WorkoutFormProps) {
  const [plannedExercises, setPlannedExercises] = useState<PlannedExercise[]>([]);
  const [plannedDuration, setPlannedDuration] = useState<number>(30);
  const [plannedDistance, setPlannedDistance] = useState<number>(5);
  const [distanceUnit, setDistanceUnit] = useState<string>("miles");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For adding exercises
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseMuscle, setNewExerciseMuscle] = useState("");
  const [addingExercise, setAddingExercise] = useState(false);

  useEffect(() => {
    if (activityType === "lifting") {
      fetchExercises().then(setExercises).catch(console.error);
    }
  }, [activityType]);

  const addPlannedExercise = (exerciseName: string) => {
    if (!plannedExercises.some(pe => pe.exercise_name === exerciseName)) {
      setPlannedExercises([...plannedExercises, { exercise_name: exerciseName, sets: 3, reps: 8, weight: 100 }]);
    }
  };

  const updatePlannedExercise = (index: number, updates: Partial<PlannedExercise>) => {
    const updated = [...plannedExercises];
    updated[index] = { ...updated[index], ...updates };
    setPlannedExercises(updated);
  };

  const removePlannedExercise = (index: number) => {
    setPlannedExercises(plannedExercises.filter((_, i) => i !== index));
  };

  const handleAddExercise = async () => {
    if (!newExerciseName.trim()) return;
    setAddingExercise(true);
    try {
      const newEx = await createExercise({
        name: newExerciseName.trim(),
        primary_muscle_group: newExerciseMuscle.trim() || undefined,
      });
      setExercises([...exercises, newEx]);
      setNewExerciseName("");
      setNewExerciseMuscle("");
      setShowAddExercise(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingExercise(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const workout = {
        plan_id: undefined,
        activity_type: activityType,
        notes,
        planned_exercises: activityType === "lifting" ? plannedExercises : undefined,
        planned_duration_minutes:
          activityType === "cardio" || activityType === "biking" || activityType === "swim"
            ? plannedDuration
            : undefined,
        planned_distance:
          activityType === "cardio" || activityType === "biking" || activityType === "swim"
            ? plannedDistance
            : undefined,
        distance_unit:
          activityType === "cardio" || activityType === "biking" || activityType === "swim"
            ? distanceUnit
            : undefined,
      };

      const session = await createWorkout(workout);
      onSuccess(session);
    } catch (exception) {
      setError((exception as Error).message || "Unable to create workout.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = activityType === "lifting" ? "Lifting plan" : activityType === "cardio" ? "Cardio plan" : activityType === "biking" ? "Biking plan" : activityType === "swim" ? "Swim plan" : "Workout plan";

  return (
    <section className="activity-selector workout-form">
      <div className="section-header">
        <h2>{title}</h2>
        <p>Enter your planned details for the next workout.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {(activityType === "lifting" || activityType === "misc") && (
          <div className="form-group">
            <label>
              Notes
              <textarea
                value={notes}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNotes(event.target.value)}
                placeholder="Add notes or goals for this workout"
              />
            </label>
          </div>
        )}

        {activityType === "lifting" && (
          <>
            <div className="form-group">
              <label>Available Exercises</label>
              <div className="exercise-list">
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => addPlannedExercise(ex.name)}
                    disabled={plannedExercises.some(pe => pe.exercise_name === ex.name)}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setShowAddExercise(true)}>Add New Exercise</button>
            </div>

            {plannedExercises.length > 0 && (
              <div className="form-group">
                <label>Planned Exercises</label>
                {plannedExercises.map((pe, index) => (
                  <div key={index} className="planned-exercise">
                    <span className="planned-exercise-name">{pe.exercise_name}</span>
                    <div className="planned-exercise-field">
                      <label>
                        Sets
                        <input
                          type="number"
                          min={1}
                          value={pe.sets}
                          onChange={(e) => updatePlannedExercise(index, { sets: Number(e.target.value) })}
                        />
                      </label>
                    </div>
                    <div className="planned-exercise-field">
                      <label>
                        Reps
                        <input
                          type="number"
                          min={1}
                          value={pe.reps}
                          onChange={(e) => updatePlannedExercise(index, { reps: Number(e.target.value) })}
                        />
                      </label>
                    </div>
                    <div className="planned-exercise-field">
                      <label>
                        Weight
                        <input
                          type="number"
                          min={0}
                          value={pe.weight || ""}
                          onChange={(e) => updatePlannedExercise(index, { weight: Number(e.target.value) || undefined })}
                        />
                      </label>
                    </div>
                    <button type="button" onClick={() => removePlannedExercise(index)}>Remove</button>
                  </div>
                ))}
              </div>
            )}

            {showAddExercise && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Add New Exercise</h3>
                  <input
                    type="text"
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                    placeholder="Exercise name"
                  />
                  <input
                    type="text"
                    value={newExerciseMuscle}
                    onChange={(e) => setNewExerciseMuscle(e.target.value)}
                    placeholder="Primary muscle group (optional)"
                  />
                  <button onClick={handleAddExercise} disabled={addingExercise}>
                    {addingExercise ? "Adding..." : "Add"}
                  </button>
                  <button onClick={() => setShowAddExercise(false)}>Cancel</button>
                </div>
              </div>
            )}
          </>
        )}

        {(activityType === "cardio" || activityType === "biking" || activityType === "swim") && (
          <>
            <div className="field-row">
              <label>
                Duration (minutes)
                <input
                  type="number"
                  min={1}
                  value={plannedDuration}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setPlannedDuration(Number(event.target.value))}
                />
              </label>
              <label>
                Distance ({distanceUnit})
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={plannedDistance}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setPlannedDistance(Number(event.target.value))}
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Distance unit
                <select value={distanceUnit} onChange={(event: ChangeEvent<HTMLSelectElement>) => setDistanceUnit(event.target.value)}>
                  <option value="miles">Miles</option>
                  <option value="kilometers">Kilometers</option>
                </select>
              </label>
            </div>
          </>
        )}

        {error ? <div className="status-message error">{error}</div> : null}

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Creating workout…" : "Start workout"}
          </button>
          <button type="button" onClick={onCancel} disabled={submitting}>
            Back
          </button>
        </div>
      </form>
    </section>
  );
}
