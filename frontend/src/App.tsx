import { useState } from "react";
import WorkoutPlanner from "./pages/WorkoutPlanner";
import WorkoutTracker from "./pages/WorkoutTracker";
import WorkoutAnalytics from "./pages/WorkoutAnalytics";
import type { WorkoutPlan, WorkoutSession } from "./api";

type AppView = "home" | "plan" | "track" | "analytics";

function App() {
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [lastCompletedWorkout, setLastCompletedWorkout] = useState<WorkoutSession | null>(null);

  const handlePlanCreated = (plan: WorkoutPlan) => {
    // Could show success message or navigate to tracker
    alert(`Workout plan "${plan.name}" created successfully!`);
    setCurrentView("home");
  };

  const handleWorkoutCompleted = (session: WorkoutSession) => {
    setLastCompletedWorkout(session);
    alert("Workout completed! Great job! 🎉");
    setCurrentView("home");
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "plan":
        return (
          <WorkoutPlanner
            onPlanCreated={handlePlanCreated}
            onCancel={() => setCurrentView("home")}
          />
        );
      case "track":
        return (
          <WorkoutTracker
            onWorkoutCompleted={handleWorkoutCompleted}
            onCancel={() => setCurrentView("home")}
          />
        );
      case "analytics":
        return (
          <WorkoutAnalytics
            onClose={() => setCurrentView("home")}
          />
        );
      default:
        return (
          <div className="home-view">
            <div className="welcome-section">
              <h2>Welcome to Your Fitness Tracker</h2>
              <p>Plan workouts, track your progress, and analyze your fitness journey.</p>
            </div>

            <div className="workflow-cards">
              <div className="workflow-card" onClick={() => setCurrentView("plan")}>
                <div className="workflow-icon">📝</div>
                <h3>Plan Workout</h3>
                <p>Create detailed workout plans with exercises, sets, reps, and goals.</p>
              </div>

              <div className="workflow-card" onClick={() => setCurrentView("track")}>
                <div className="workflow-icon">🏃‍♂️</div>
                <h3>Start Workout</h3>
                <p>Execute your planned workouts with built-in tracking and timers.</p>
              </div>

              <div className="workflow-card" onClick={() => setCurrentView("analytics")}>
                <div className="workflow-icon">📊</div>
                <h3>View Analytics</h3>
                <p>Review your workout history, progress, and performance insights.</p>
              </div>
            </div>

            {lastCompletedWorkout && (
              <div className="last-workout-banner">
                <h3>Last Workout Completed! 🎉</h3>
                <p>
                  {lastCompletedWorkout.activity_type.replace(/^[a-z]/, (char) => char.toUpperCase())} workout on{' '}
                  {new Date(lastCompletedWorkout.started_at).toLocaleDateString()}
                  {lastCompletedWorkout.overall_feeling && ` - Felt ${lastCompletedWorkout.overall_feeling}`}
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Fitness Tracker</p>
          <h1>Plan. Track. Analyze.</h1>
        </div>
        <div className="header-actions">
          {currentView !== "home" && (
            <button type="button" onClick={() => setCurrentView("home")}>
              Home
            </button>
          )}
        </div>
      </header>
      <main className="page-container">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;
