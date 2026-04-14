import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/App.css";

// Cache buster - April 14, 2026 - Three workflow system deployed
console.log("🚀 Fitness Tracker v3.0 - Three Workflow System Loaded");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
