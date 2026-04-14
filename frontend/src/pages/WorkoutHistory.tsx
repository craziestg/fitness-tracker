import { useEffect, useState } from "react";
import { fetchWorkouts, WorkoutSession } from "../api";

type WorkoutHistoryProps = {
  onClose: () => void;
};

export default function WorkoutHistory({ onClose }: WorkoutHistoryProps) {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkouts()
      .then((data) => {
        setWorkouts(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Unable to load workouts.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="activity-selector workout-history">
      <div className="section-header">
        <h2>Workout history</h2>
        <p>Review past sessions and workout planning details.</p>
      </div>

      {loading ? (
        <div className="status-message">Loading workouts…</div>
      ) : error ? (
        <div className="status-message error">{error}</div>
      ) : workouts.length === 0 ? (
        <div className="status-message">No workouts logged yet.</div>
      ) : (
        <div className="history-grid">
          {workouts.map((session) => (
            <article key={session.id} className="history-card">
              <div className="history-card__header">
                <strong>{session.activity_type.replace(/^[a-z]/, (char) => char.toUpperCase())}</strong>
                <span>{new Date(session.started_at).toLocaleDateString()}</span>
              </div>
              <p>Started at {new Date(session.started_at).toLocaleTimeString()}</p>
              {session.planned_exercises ? (
                <div>
                  <p>Exercises:</p>
                  <ul>
                    {session.planned_exercises.map((pe, i) => (
                      <li key={i}>{pe.exercise_name}: {pe.sets} sets × {pe.reps} reps @ {pe.weight || "—"} lbs</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <>
                  <p>Duration: {session.planned_duration_minutes ?? "—"} minutes</p>
                  <p>Distance: {session.planned_distance ?? "—"} {session.distance_unit ?? ""}</p>
                </>
              )}
              <p>Distance: {session.planned_distance ?? "—"} {session.distance_unit ?? ""}</p>
              {session.notes ? <p className="history-notes">Notes: {session.notes}</p> : null}
            </article>
          ))}
        </div>
      )}

      <div className="button-row">
        <button type="button" onClick={onClose} className="primary-button">
          Back to planner
        </button>
      </div>
    </section>
  );
}
