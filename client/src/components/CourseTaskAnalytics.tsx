import React, { useEffect, useState } from "react";
import "../pages/Analytics.css";

interface CourseStat {
  courseName: string;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
}

const CourseTaskAnalytics: React.FC = () => {
  const [courseStats, setCourseStats] = useState<CourseStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tasks/course-stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data: CourseStat[] = await response.json();
          console.log("Fetched Course Stats:", data);
          setCourseStats(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch course stats");
        }
      } catch (error) {
        setError("An error occurred while fetching course stats.");
        console.error("Error fetching course stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseStats();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="analytics-section">
      <h2>Tasks by Course</h2>
      <div className="course-stats-cards">
        {courseStats.map((stat, index) => (
          <div className="course-card" key={index}>
            <h3>{stat.courseName}</h3>
            <p><strong>Completed:</strong> {stat.completed}</p>
            <p><strong>Pending:</strong> {stat.pending}</p>
            <p><strong>In Progress:</strong> {stat.inProgress}</p>
            <p><strong>Overdue:</strong> {stat.overdue}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseTaskAnalytics;