import { useEffect, useState } from "react";
import { fetchActivities, Activity } from "../api";

type ActivitySelectorProps = {
  onSelect: (activityType: string) => void;
};

export default function ActivitySelector({ onSelect }: ActivitySelectorProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities()
      .then((data) => {
        setActivities(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Unable to load activities.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="activity-selector">
      <div className="section-header">
        <h2>Choose an activity</h2>
        <p>Select the workout style you want to log today.</p>
      </div>

      {loading ? (
        <div className="status-message">Loading activities…</div>
      ) : error ? (
        <div className="status-message error">{error}</div>
      ) : (
        <div className="activity-grid">
          {activities.map((activity) => (
            <button
              key={activity.type}
              className="activity-card"
              onClick={() => onSelect(activity.type)}
              type="button"
            >
              <strong>{activity.display_name}</strong>
              <p>{activity.description}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
