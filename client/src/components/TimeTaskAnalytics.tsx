import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../pages/Analytics.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TimeTaskAnalytics: React.FC = () => {
  const [timeStats, setTimeStats] = useState<any[]>([]);
  const [timeUnit, setTimeUnit] = useState<"week" | "month">("week");

  useEffect(() => {
    const fetchTimeStats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tasks/time-stats?timeUnit=${timeUnit}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTimeStats(data);
        } else {
          console.error("Failed to fetch time stats");
        }
      } catch (error) {
        console.error("Error fetching time stats:", error);
      }
    };

    fetchTimeStats();
  }, [timeUnit]);

  if (timeStats.length === 0) return <p>Loading...</p>;

  const data = {
    labels: timeStats.map((stat) => `Week/Month ${stat._id}`),
    datasets: [
      {
        label: "Completed Tasks",
        data: timeStats.map((stat) => stat.completed),
        backgroundColor: "#4caf50",
      },
      {
        label: "Created Tasks",
        data: timeStats.map((stat) => stat.created),
        backgroundColor: "#2196f3",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Tasks by ${timeUnit === "week" ? "Week" : "Month"}`,
      },
    },
  };

  return (
    <div className="analytics-section">
      <h2>Tasks by Time</h2>
      <div>
        <button onClick={() => setTimeUnit("week")}>Weekly</button>
        <button onClick={() => setTimeUnit("month")}>Monthly</button>
      </div>
      <Bar data={data} options={options} />
    </div>
  );
};

export default TimeTaskAnalytics;