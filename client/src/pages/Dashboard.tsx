import React, { useEffect, useState } from 'react';
import NotificationBell from "../components/NotificationBell";

import './Dashboard.css';

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  status: string;
  courseCode: string;
}

const Dashboard: React.FC = () => {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string | null>(null);

  // get greeting based on time
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return "Good Morning!";
    } else if (currentHour < 18) {
      return "Good Afternoon!";
    } else {
      return "Good Evening!";
    }
  };

  // get today's tasks
  const fetchTodayTasks = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `http://localhost:5000/api/tasks/by-due-date?dueDate=${today}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTodayTasks(data);
      } else {
        console.error("Failed to fetch today's tasks");
      }
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
    }
  };

  // get upcoming tasks
  const fetchUpcomingTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tasks/by-week", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUpcomingTasks(data);
      } else {
        console.error("Failed to fetch upcoming tasks");
      }
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);
    }
  };

  // setup initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchTodayTasks();
      await fetchUpcomingTasks();
      setLoading(false);
    };

    fetchData();
  }, []);

  // update task status
  const handleUpdateStatus = async () => {
    if (!selectedTask || !newStatus) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/update-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ taskId: selectedTask._id, status: newStatus }),
        }
      );

      if (response.ok) {
        setCustomMessage("Status updated!");
        setTimeout(() => setCustomMessage(null), 2000);
        closeTaskDetails();
      } else {
        setCustomMessage("Update failed!");
        setTimeout(() => setCustomMessage(null), 2000);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      setCustomMessage("Error occurred!");
      setTimeout(() => setCustomMessage(null), 2000);
    }
  };

  const closeTaskDetails = () => {
    setSelectedTask(null);
    setNewStatus("");
  };

  return (
    <div className="dashboard-container">
      {/* Custom Message */}
      {customMessage && <div className="custom-message">{customMessage}</div>}
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="time-section">
          <h1>
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </h1>
          <p>{new Date().toLocaleDateString()}</p>
        </div>
        <div className="greeting-section">
          <h2>{getGreeting()}</h2>
          <p>You have {todayTasks.length} tasks due today.</p>
        </div>
          {/* Add Notification Bell here */}
  <NotificationBell />
      </div>

      {/* Upcoming Section */}
      <div className="upcoming-section">
        <div className="upcoming-item">
          <h3>Today's Tasks</h3>
          {loading ? (
            <p>Loading...</p>
          ) : todayTasks.length > 0 ? (
            <ul>
              {todayTasks.map((task) => (
                <li
                  key={task._id}
                  onClick={() =>
                    setSelectedTask({ ...task, _id: task._id || task._id })
                  } // 确保 id 或 _id 被正确设置// 点击任务时设置选中的任务
                  className="task-item"
                >
                  <strong>{task.title}</strong> - Due:{" "}
                  {new Date(task.dueDate).toLocaleDateString()}{" "}
                  {task.dueTime || "All day"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No tasks due today.</p>
          )}
        </div>
        <div className="upcoming-item">
          <h3>Upcoming Tasks</h3>
          {loading ? (
            <p>Loading...</p>
          ) : upcomingTasks.length > 0 ? (
            <ul>
              {upcomingTasks.map((task) => (
                <li
                  key={task._id}
                  onClick={() => setSelectedTask(task)}
                  className="task-item"
                >
                  <strong>{task.title}</strong> - Due:{" "}
                  {new Date(task.dueDate).toLocaleDateString()}{" "}
                  {task.dueTime || "All day"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No tasks scheduled for the upcoming week.</p>
          )}
        </div>
      </div>

      {/* Task Details Overlay */}
      {selectedTask && (
        <div className="task-details-overlay">
          <div className="task-details">
            <button className="close-button" onClick={closeTaskDetails}>
              ✖
            </button>
            <h1>{selectedTask.title}</h1>
            <p>
              <strong>Description:</strong> {selectedTask.description}
            </p>
            <p>
              <strong>Due Date:</strong>{" "}
              {new Date(selectedTask.dueDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Due Time:</strong> {selectedTask.dueTime || "All day"}
            </p>
            <p>
              <strong>Status:</strong> {selectedTask.status}
            </p>
            <p>
              <strong>Course Code:</strong> {selectedTask.courseCode}
            </p>

            {/* Status Update Component */}
            <div className="status-update">
              <label htmlFor="status-select">Change Status:</label>
              <select
                id="status-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
              <button
                className="update-status-button"
                onClick={handleUpdateStatus}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
