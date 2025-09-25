import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../pages/Analytics.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const TaskStatusAnalytics: React.FC = () => {
  const [statusStats, setStatusStats] = useState<{
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
  } | null>(null);

  useEffect(() => {
    const fetchStatusStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tasks/status-stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStatusStats(data);
        } else {
          console.error("Failed to fetch status stats");
        }
      } catch (error) {
        console.error("Error fetching status stats:", error);
      }
    };

    fetchStatusStats();
  }, []);

  if (!statusStats) return <p>Loading...</p>;

  const data = {
    labels: ["Completed", "Pending", "In Progress", "Overdue"],
    datasets: [
      {
        data: [
          statusStats.completed,
          statusStats.pending,
          statusStats.inProgress,
          statusStats.overdue,
        ],
        backgroundColor: ["#4caf50", "#ff9800", "#2196f3", "#f44336"],
      },
    ],
  };

  return (
    <div className="analytics-section">
      <h2>Task Status Statistics</h2>
      <Pie data={data} />
    </div>
  );
};

export default TaskStatusAnalytics;