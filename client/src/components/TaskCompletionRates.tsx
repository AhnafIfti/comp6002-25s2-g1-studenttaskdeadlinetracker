import React, { useEffect, useState } from "react";
import "../pages/Analytics.css";

interface CompletionRate {
  courseName: string;
  total: number;
  completed: number;
  completionRate: number;
}


const TaskCompletionRates: React.FC = () => {
  const [completionRates, setCompletionRates] = useState<CompletionRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletionRates = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tasks/completion-rates", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data: CompletionRate[] = await response.json();
          console.log("Fetched Completion Rates:", data);
          setCompletionRates(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch completion rates");
        }
      } catch (error) {
        setError("An error occurred while fetching completion rates.");
        console.error("Error fetching completion rates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionRates();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="analytics-section">
      <h2>Task Completion Rates</h2>
      <table className="completion-rates-table">
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Total Tasks</th>
            <th>Completed Tasks</th>
            <th>Completion Rate (%)</th>
          </tr>
        </thead>
        <tbody>
          {completionRates.map((rate, index) => (
            <tr key={index}>
              <td>{rate.courseName}</td>
              <td>{rate.total}</td>
              <td>{rate.completed}</td>
              <td>{rate.completionRate.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskCompletionRates;