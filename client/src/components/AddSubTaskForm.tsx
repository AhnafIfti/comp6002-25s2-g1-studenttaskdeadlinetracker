import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddTaskForm.css";

export interface Subtask {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  status?: string;
  parentTask?: string;
  userId?: string;
  assignee?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AddSubTaskFormProps {
  parentTaskId: string;
  onClose: () => void;
  onAddSubtask: (created: Subtask) => void;
}

interface User {
  _id: string;
  name?: string;
  email?: string;
}

const AddSubTaskForm: React.FC<AddSubTaskFormProps> = ({
  parentTaskId,
  onClose,
  onAddSubtask,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    status: "pending",
    assignee: "",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
      const fetchAssignees = async () => {
        setLoadingUsers(true);
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `http://localhost:5000/api/tasks/${encodeURIComponent(
              parentTaskId
            )}/assignees`,
            {
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            }
          );
          if (!res.ok) {
            console.warn("Could not fetch assignees for parent task.");
            setUsers([]);
            setLoadingUsers(false);
            return;
          }
          const data = await res.json();
          // expected: array of users [{ _id, name, email }]
          setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Error fetching assignees:", err);
          setUsers([]);
        } finally {
          setLoadingUsers(false);
        }
      };

      fetchAssignees();
    }, [parentTaskId]);

  const isValidDateStr = (date: string) => {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(date);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const formatDueDateToISO = (mmddyyyy: string) => {
    const [mm, dd, yyyy] = mmddyyyy.split("/").map(Number);
    if (!mm || !dd || !yyyy) return mmddyyyy;
    const d = new Date(yyyy, mm - 1, dd);
    if (isNaN(d.getTime())) return mmddyyyy;
    return d.toISOString().split("T")[0];
  };

  const formatDueTime = (timeValue: string) => {
    if (!timeValue) return timeValue;
    const t = new Date(`1970-01-01T${timeValue}:00`);
    return t.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!formData.dueDate.trim() || !isValidDateStr(formData.dueDate)) {
      toast.error("Due date is required and must be MM/DD/YYYY.");
      return;
    }
    if (!formData.dueTime.trim()) {
      toast.error("Due time is required.");
      return;
    }
    if (!formData.assignee.trim()) {
      toast.error("Assignee (user id) is required.");
      return;
    }

    const token = localStorage.getItem("token");

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      dueDate: formatDueDateToISO(formData.dueDate),
      dueTime: formatDueTime(formData.dueTime),
      status: formData.status || "pending",
      assignee: formData.assignee.trim()
    };

    try {
      const res = await fetch(
        `http://localhost:5000/api/tasks/${encodeURIComponent(
          parentTaskId
        )}/subtasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("Create subtask failed:", err);
        toast.error(err.message || "Failed to create subtask");
        return;
      }

      const created: Subtask = await res.json();
      toast.success("Subtask created");
      onAddSubtask(created);
      onClose();
    } catch (error) {
      console.error("Error creating subtask:", error);
      toast.error("Server error while creating subtask.");
    }
  };

  return (
    <div className="modal-overlay">
      <ToastContainer />
      <div className="new-task-form">
        <form onSubmit={handleSubmit} className="add-task-form">
          <h2>New Task</h2>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              type="text"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Details</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date (MM/DD/YYYY) *</label>
            <input
              id="dueDate"
              name="dueDate"
              placeholder="MM/DD/YYYY"
              value={formData.dueDate}
              onChange={handleChange}
              type="text"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueTime">Due Time *</label>
            <input
              id="dueTime"
              name="dueTime"
              value={formData.dueTime}
              onChange={handleChange}
              type="time"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">pending</option>
              <option value="in-progress">in-progress</option>
              <option value="completed">completed</option>
              <option value="overdue">overdue</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assignee">Assignee *</label>
            {loadingUsers ? (
              <div>Loading assignees...</div>
            ) : users.length > 0 ? (
              <select
                id="assignee"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
              >
                <option value="">Select assignee</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name ? `${u.name}${u.email ? ` (${u.email})` : ""}` : u.email || u._id}
                  </option>
                ))}
              </select>
            ) : (
              <select id="assignee" name="assignee" value={formData.assignee} onChange={handleChange}>
                <option value="">No assignees available</option>
              </select>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="add-cancel-button"
            >
              Cancel
            </button>
            <button type="submit" className="add-submit-button">
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubTaskForm;
