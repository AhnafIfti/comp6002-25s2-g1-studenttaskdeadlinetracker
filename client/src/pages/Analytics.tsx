import React, { useState } from "react";
import TaskStatusAnalytics from "../components/TaskStatusAnalytics";
import CourseTaskAnalytics from "../components/CourseTaskAnalytics";
import TimeTaskAnalytics from "../components/TimeTaskAnalytics";
import TaskCompletionRates from "../components/TaskCompletionRates"; // Import task completion rates component
import "./Analytics.css";

const Analytics: React.FC = () => {
  const [activePage, setActivePage] = useState(0); // Currently displayed component index

  // Define component list
  const pages = [
    { name: "Task Status", component: <TaskStatusAnalytics /> },
    { name: "Course Tasks", component: <CourseTaskAnalytics /> },
    { name: "Time Analytics", component: <TimeTaskAnalytics /> },
    { name: "Completion Rates", component: <TaskCompletionRates /> },
  ];

  return (
    <div className="analytics-page">
      <h1>Analytics</h1>

      {/* Render the currently active component */}
      <div className="analytics-content">{pages[activePage].component}</div>

      {/* Pagination buttons */}
      <div className="pagination-buttons">
        {pages.map((page, index) => (
          <button
            key={index}
            className={`pagination-button ${activePage === index ? "active" : ""}`}
            onClick={() => setActivePage(index)} // Switch to the corresponding component
          >
            {page.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Analytics;