import { useState, useEffect } from "react";
import type { WorkoutSession } from "../api";
import { fetchWorkouts } from "../api";

interface WorkoutAnalyticsProps {
  onClose?: () => void;
}

function WorkoutAnalytics({ onClose }: WorkoutAnalyticsProps) {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("week");

  useEffect(() => {
    fetchWorkouts()
      .then(setWorkouts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filterWorkoutsByPeriod = (workouts: WorkoutSession[]) => {
    const now = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "all":
        return workouts;
    }

    return workouts.filter(workout => new Date(workout.started_at) >= startDate);
  };

  const getWorkoutsByDate = (workouts: WorkoutSession[]) => {
    const grouped: { [date: string]: WorkoutSession[] } = {};

    workouts.forEach(workout => {
      const date = new Date(workout.started_at).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(workout);
    });

    return grouped;
  };

  const calculateStats = (workouts: WorkoutSession[]) => {
    const completed = workouts.filter(w => w.finished_at);
    const totalWorkouts = workouts.length;
    const completedWorkouts = completed.length;

    const feelings = completed
      .map(w => w.overall_feeling)
      .filter(Boolean) as string[];

    const feelingCounts = feelings.reduce((acc, feeling) => {
      acc[feeling] = (acc[feeling] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const totalDuration = completed
      .map(w => w.actual_duration_minutes || w.planned_duration_minutes || 0)
      .reduce((sum, duration) => sum + duration, 0);

    return {
      totalWorkouts,
      completedWorkouts,
      completionRate: totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0,
      feelingCounts,
      totalDuration,
      averageDuration: completedWorkouts > 0 ? totalDuration / completedWorkouts : 0,
    };
  };

  const filteredWorkouts = filterWorkoutsByPeriod(workouts);
  const workoutsByDate = getWorkoutsByDate(filteredWorkouts);
  const stats = calculateStats(filteredWorkouts);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getFeelingEmoji = (feeling?: string) => {
    switch (feeling) {
      case "great": return "💪";
      case "good": return "👍";
      case "okay": return "😐";
      case "tough": return "😅";
      case "terrible": return "😩";
      default: return "🤔";
    }
  };

  if (loading) {
    return (
      <div className="workout-analytics">
        <h2>Workout History & Analytics</h2>
        <div className="loading">Loading workouts...</div>
      </div>
    );
  }

  return (
    <div className="workout-analytics">
      <div className="analytics-header">
        <h2>Workout History & Analytics</h2>
        <div className="period-selector">
          <button
            type="button"
            className={selectedPeriod === "week" ? "active" : ""}
            onClick={() => setSelectedPeriod("week")}
          >
            This Week
          </button>
          <button
            type="button"
            className={selectedPeriod === "month" ? "active" : ""}
            onClick={() => setSelectedPeriod("month")}
          >
            This Month
          </button>
          <button
            type="button"
            className={selectedPeriod === "all" ? "active" : ""}
            onClick={() => setSelectedPeriod("all")}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <h3>Total Workouts</h3>
          <div className="stat-value">{stats.totalWorkouts}</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-value">{stats.completedWorkouts}</div>
          <div className="stat-subtitle">{stats.completionRate.toFixed(1)}% completion rate</div>
        </div>
        <div className="stat-card">
          <h3>Total Time</h3>
          <div className="stat-value">{formatDuration(stats.totalDuration)}</div>
        </div>
        <div className="stat-card">
          <h3>Avg Duration</h3>
          <div className="stat-value">{formatDuration(Math.round(stats.averageDuration))}</div>
        </div>
      </div>

      {Object.keys(stats.feelingCounts).length > 0 && (
        <div className="feelings-overview">
          <h3>How You Felt</h3>
          <div className="feelings-chart">
            {Object.entries(stats.feelingCounts).map(([feeling, count]) => (
              <div key={feeling} className="feeling-item">
                <span className="feeling-emoji">{getFeelingEmoji(feeling)}</span>
                <span className="feeling-label">{feeling}</span>
                <span className="feeling-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="calendar-view">
        <h3>Workout Calendar</h3>
        {Object.keys(workoutsByDate).length === 0 ? (
          <p className="no-workouts">No workouts found for this period.</p>
        ) : (
          <div className="calendar-entries">
            {Object.entries(workoutsByDate)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dayWorkouts]) => (
                <div key={date} className="calendar-day">
                  <h4>{new Date(date).toLocaleDateString()}</h4>
                  <div className="day-workouts">
                    {dayWorkouts.map((workout) => (
                      <div key={workout.id} className="workout-entry">
                        <div className="workout-summary">
                          <span className="activity-type">
                            {workout.activity_type.replace(/^[a-z]/, (char) => char.toUpperCase())}
                          </span>
                          <span className="workout-time">
                            {new Date(workout.started_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {workout.finished_at && (
                            <span className="completion-status completed">
                              ✓ Completed
                            </span>
                          )}
                        </div>

                        {workout.planned_exercises && workout.planned_exercises.length > 0 && (
                          <div className="workout-exercises">
                            {workout.planned_exercises.map((exercise, index) => (
                              <span key={index} className="exercise-chip">
                                {exercise.exercise_name}
                              </span>
                            ))}
                          </div>
                        )}

                        {workout.overall_feeling && (
                          <div className="workout-feeling">
                            Felt: {getFeelingEmoji(workout.overall_feeling)} {workout.overall_feeling}
                          </div>
                        )}

                        {workout.favorite_part && (
                          <div className="workout-favorite">
                            Favorite: {workout.favorite_part}
                          </div>
                        )}

                        {(workout.actual_duration_minutes || workout.planned_duration_minutes) && (
                          <div className="workout-duration">
                            Duration: {formatDuration(workout.actual_duration_minutes || workout.planned_duration_minutes!)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {onClose && (
        <div className="analytics-actions">
          <button type="button" onClick={onClose} className="close-button">
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default WorkoutAnalytics;