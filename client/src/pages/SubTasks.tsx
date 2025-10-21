import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // Reintroduce toast for validation
import "react-toastify/dist/ReactToastify.css";
import "./Tasks.css";

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  status: string;
  courseCode: string;
  groupstatus: string;
}

interface Course {
  _id: string;
  code: string;
  name: string;
}

const SubTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]); // All tasks
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false); // Loading state
  const [activeTab, setActiveTab] = useState("pending"); // Default tab
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const tasksPerPage = 5; // Number of tasks per page

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [newStatus, setNewStatus] = useState<string>("");
  const [statusOptions] = useState([
    "pending",
    "in-progress",
    "completed",
    "overdue",
  ]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const location = useLocation();

  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false); // State for delete success message

  const isValidDate = (date: string) => {
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    return dateRegex.test(date);
  };

  const formatDateForInput = (isoDate: string) => {
    const date = new Date(isoDate);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const courseCode = queryParams.get("course");
    if (courseCode) {
      setSelectedCourse(courseCode);
    }
  }, [location]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/courses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          console.error("Failed to fetch courses:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const openDeleteConfirm = (taskId: string) => {
    setDeleteId(taskId);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleDeleteTask = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${deleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setSelectedTask(null);
        fetchTasksByStatus(activeTab);
        setShowDeleteSuccess(true); // Show success message
        setTimeout(() => {
          setShowDeleteSuccess(false); // Hide success message after 3 seconds
        }, 3000);
        closeDeleteConfirm();
      } else {
        const errorData = await response.json();
        console.error(`Failed to delete task: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditTask = async (updatedTask: Task) => {
    // Toast validation for required fields
    if (!updatedTask.title?.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!updatedTask.dueDate?.trim()) {
      toast.error("Due Date is required.");
      return;
    }
    if (!isValidDate(updatedTask.dueDate)) {
      toast.error("Due Date must be in MM/DD/YYYY format.");
      return;
    }
    if (!updatedTask.dueTime?.trim()) {
      toast.error("Due Time is required.");
      return;
    }
    if (!updatedTask.status?.trim()) {
      toast.error("Status is required.");
      return;
    }
    if (!updatedTask.groupstatus?.trim()) {
      toast.error("Group Status is required.");
      return;
    }

    try {
      const [month, day, year] = updatedTask.dueDate.split("/");
      const formattedDueDate = new Date(`${year}-${month}-${day}`)
        .toISOString()
        .split("T")[0];
      const [hours, minutes] = updatedTask.dueTime.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      const formattedDueTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const response = await fetch(
        `http://localhost:5000/api/tasks/${updatedTask._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: updatedTask.title,
            description: updatedTask.description,
            dueDate: formattedDueDate,
            dueTime: formattedDueTime,
            status: updatedTask.status,
            groupstatus: updatedTask.groupstatus,
          }),
        }
      );

      if (response.ok) {
        const updatedTaskFromServer = await response.json();
        setEditingTask(null);
        setSelectedTask(updatedTaskFromServer);
        fetchTasksByStatus(activeTab);

        // Show success toast immediately
        toast.success("Task updated successfully!");
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update task: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("An error occurred while updating the task.");
    }
  };

  const handleUpdateStatus = async () => {
    // Toast validation for required fields
    if (!selectedTask) {
      toast.error("No task selected.");
      return;
    }
    if (!newStatus.trim()) {
      toast.error("Status is required.");
      return;
    }

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
        const updatedTask = await response.json();
        toast.success("Task status updated successfully!");
        setSelectedTask(updatedTask);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update task status: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("An error occurred while updating the task status.");
    }
  };

  // Fetch tasks by status
  const fetchTasksByStatus = async (status: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/by-status?status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setTasks(data);
      setCurrentPage(1); // Reset to the first page when switching tabs
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single task by ID
  const fetchTaskById = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setSelectedTask(data);
    } catch (error) {
      console.error("Error fetching task:", error);
    }
  };

  // Close the task view
  const closeTaskView = () => {
    setSelectedTask(null);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchTasksByStatus(tab); // Fetch tasks for the selected tab
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesCourse = selectedCourse
      ? task.courseCode === selectedCourse
      : true;
    const matchesStatus = activeTab ? task.status === activeTab : true;
    return matchesCourse && matchesStatus;
  });

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  const handleCourseFilterChange = (courseCode: string) => {
    setSelectedCourse(courseCode);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    fetchTasksByStatus(activeTab); // Load tasks on component mount
  }, [activeTab]);

  return (
    <div className="tasks-page">
      {/* Toast container for validation messages */}
      <div>
        <ToastContainer />
      </div>
      {showDeleteSuccess && (
        <div className="delete-success-message">Task deleted successfully!</div>
      )}
      {/* Left section: Task list */}
      <div className="tasks-list">
        <div className="tasks-header">
          <h1>Deadline</h1>
          <button
            className="add-deadline-button"
            // onClick={() => setShowOverlay(true)}
          >
            Add Deadline
          </button>
          {/* <select
            className="course-filter"
            value={selectedCourse}
            onChange={(e) => handleCourseFilterChange(e.target.value)}
          >
            <option value="">Select Subject</option>
            {courses.map((course) => (
              <option key={course._id} value={course.code}>
                {course.code}
              </option>
            ))}
          </select> */}
        </div>
        <div className="tasks-tabs">
          <button
            className={activeTab === "pending" ? "active" : ""}
            onClick={() => handleTabChange("pending")}
          >
            Pending
          </button>
          <button
            className={activeTab === "in-progress" ? "active" : ""}
            onClick={() => handleTabChange("in-progress")}
          >
            In Progress
          </button>
          <button
            className={activeTab === "completed" ? "active" : ""}
            onClick={() => handleTabChange("completed")}
          >
            Completed
          </button>
          <button
            className={activeTab === "overdue" ? "active" : ""}
            onClick={() => handleTabChange("overdue")}
          >
            Overdue
          </button>
        </div>
        <div className="tasks-section">
          {loading ? (
            <p>Loading...</p>
          ) : (
            currentTasks.map((task) => (
              <div
                key={task._id}
                className={`task-card ${
                  selectedTask?._id === task._id ? "selected" : ""
                }`}
                onClick={() => fetchTaskById(task._id)}
              >
                <h2 className="task-title">{task.title}</h2>
                <p className="task-course">{task.courseCode}</p>
                <p className="task-due-date">
                  {new Date(task.dueDate).toLocaleDateString()} {task.dueTime}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="pagination">
          {Array.from(
            { length: Math.ceil(filteredTasks.length / tasksPerPage) },
            (_, index) => (
              <button
                key={index}
                className={currentPage === index + 1 ? "active" : ""}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      </div>

      {/* Right section: Task view */}
      {selectedTask && (
        <div className="task-view">
          <div className="task-view-header">
            <h2>{selectedTask.title}</h2>
            <div className="task-view-actions">
              <button
                className="task-delete-button"
                onClick={() => openDeleteConfirm(selectedTask._id)}
              >
                🗑️
              </button>
              <button
                className="task-edit-button"
                onClick={() => setEditingTask(selectedTask)}
              >
                ✎
              </button>
              <button className="task-close-button" onClick={closeTaskView}>
                ✖
              </button>
            </div>
          </div>
          <p className="task-view-date">
            <strong>Due Date:</strong>{" "}
            {new Date(selectedTask.dueDate).toLocaleDateString()}{" "}
            {selectedTask.dueTime}
          </p>
          <p className="task-view-course">
            <strong>Course Code:</strong> {selectedTask.courseCode}
          </p>
          <p className="task-view-status">
            <strong>Status:</strong> {selectedTask.status}
          </p>
          <p className="task-view-description">
            <strong>Description:</strong> {selectedTask.description}
          </p>

          <div className="status-update">
            <label htmlFor="status-select">Change Status:</label>
            <select
              id="status-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              className="update-status-button"
              onClick={handleUpdateStatus}
            >
              Update Status
            </button>
          </div>
        </div>
      )}

      {/* edit form */}
      {editingTask && (
        <div className="edit-task-overlay">
          <div className="edit-task-form">
            <button
              className="close-button"
              onClick={() => setEditingTask(null)}
            >
              ✖
            </button>
            <h2>Edit Task</h2>
            <label>
              Title:
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
              />
            </label>
            <label>
              Description:
              <textarea
                value={editingTask.description}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    description: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Due Date:
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={
                  editingTask.dueDate
                    ? formatDateForInput(editingTask.dueDate)
                    : ""
                }
                onChange={(e) =>
                  setEditingTask({ ...editingTask, dueDate: e.target.value })
                }
              />
            </label>
            <label>
              Due Time:
              <input
                type="time"
                value={editingTask.dueTime || ""}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, dueTime: e.target.value })
                }
              />
            </label>
            <label>
              Status:
              <select
                value={editingTask.status}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, status: e.target.value })
                }
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </label>
            <label>
              Group Status:
              <select
                value={editingTask.groupstatus}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    groupstatus: e.target.value,
                  })
                }
              >
                <option value="individual">Individual</option>
                <option value="group">Group</option>
              </select>
            </label>
            <button
              className="save-button"
              onClick={() => handleEditTask(editingTask)}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal box*/}
      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this task?</p>
            <div className="modal-footer">
              <button
                type="button"
                className="cancel"
                onClick={closeDeleteConfirm}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-confirm"
                onClick={handleDeleteTask}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubTasks;
