/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddTaskForm.css";

interface TaskData {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  groupstatus: string;
  courseId: string;
  groupId?: string;
}

interface AddTaskFormProps {
  onClose: () => void;
  onAddTask: (newTask: TaskData) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onClose, onAddTask }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    groupstatus: "",
    courseId: "",
    groupId: "",
  });

    const [groups, setGroups] = useState<{ id: string; name: string }[]>([]); // added
    const [loadingGroups, setLoadingGroups] = useState(false); // added

     const [courses, setCourses] = useState<
       { id: string; code?: string; name?: string }[]
     >([]);
     const [loadingCourses, setLoadingCourses] = useState(false);

    useEffect(() => {
      // fetch groups when user chooses "group" type
      const fetchGroups = async () => {
        try {
          setLoadingGroups(true);
          const res = await fetch("http://localhost:5000/api/groups", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (!res.ok) {
            setGroups([]);
            return;
          }
          const {groups} = await res.json();

          const normalized = (groups || []).map((g: any) => ({
            id: g.id || g._id || g._id,
            name: g.name || "Unnamed Group",
          }));
          setGroups(normalized);
        } catch (err) {
          console.error("Failed to load groups", err);
          setGroups([]);
        } finally {
          setLoadingGroups(false);
        }
      };

      if (formData.groupstatus === "group") {
        fetchGroups();
      } else {
        // clear selected group if switched back to individual
        setFormData((prev) => ({ ...prev, groupId: "" }));
        setGroups([]);
      }
    }, [formData.groupstatus]);

     useEffect(() => {
       const fetchCourses = async () => {
         try {
           setLoadingCourses(true);
           const res = await fetch("http://localhost:5000/api/courses", {
             headers: {
               Authorization: `Bearer ${localStorage.getItem("token")}`,
             },
           });
           if (!res.ok) {
             setCourses([]);
             return;
           }
           const data = await res.json();
           const raw = Array.isArray(data) ? data : data.courses || [];
           const normalized = (raw || []).map((c: any) => ({
             id: c._id || c.id,
             code: c.code,
             name: c.name || c.title,
           }));
           setCourses(normalized);
         } catch (err) {
           console.error("Failed to load courses", err);
           setCourses([]);
         } finally {
           setLoadingCourses(false);
         }
       };

       fetchCourses();
     }, []);

  const validateForm = () => {
    let isValid = true;

    if (!formData.title.trim()) {
      toast.error("Title is required.");
      isValid = false;
    }

    // require group selection when group type is chosen
    if (formData.groupstatus === "group" && !formData.groupId.trim()) {
      toast.error("Please select a group for a group task.");
      isValid = false;
    }

    if (!formData.dueDate.trim()) {
      toast.error("Due date is required.");
      isValid = false;
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dueDate)) {
      toast.error("Due date must be in MM/DD/YYYY format.");
      isValid = false;
    } else {
      const [month, day, year] = formData.dueDate.split("/").map(Number);
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        toast.error("Due date must have a valid month (1-12) and day (1-31).");
        isValid = false;
      } else {
        const dueDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Ignore time for comparison
        if (isNaN(dueDate.getTime()) || dueDate < today) {
          toast.error("Due date must be a valid future date.");
          isValid = false;
        }
      }
    }

    if (!formData.dueTime.trim()) {
      toast.error("Due time is required.");
      isValid = false;
    }

    if (!formData.groupstatus.trim()) {
      toast.error("Task type is required.");
      isValid = false;
    }

    if (!formData.courseId.trim()) {
      toast.error("Please select a course.");
      isValid = false;
    }

    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const formattedDueTime = new Date(
        `1970-01-01T${formData.dueTime}:00`
      ).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      try {
          const courseId = formData.courseId;

        // Construct newTask with fetched courseId
        const newTask: TaskData = {
          ...formData,
          dueTime: formattedDueTime,
          courseId, // Use fetched courseId
          groupId: formData.groupId || undefined,
        };

        console.log("Submitting task data:", newTask);

        // Submit task to backend
        const response = await fetch("http://localhost:5000/api/tasks/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(newTask),
        });

        if (response.ok) {
          const result = await response.json();
          onAddTask(result);
          localStorage.setItem("lastTask", JSON.stringify(result));
        } else {
          const errorData = await response.json();
          console.error("Failed to add task:", errorData);
          toast.error(`Error: ${errorData.message || "Failed to add task"}`);
        }
      } catch (error) {
        console.error("Error while adding task:", error);
        toast.error("An error occurred while adding the task.");
      }
    }
  };

  return (
    <div className="modal-overlay">
      <ToastContainer />
      <div className="new-task-form">
        <form onSubmit={handleSubmit} className="add-task-form">
          <h2>New Deadline</h2>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
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
            <label htmlFor="dueDate">Due Date *</label>
            <input
              type="text"
              id="dueDate"
              name="dueDate"
              placeholder="MM/DD/YYYY"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueTime">Due Time *</label>
            <input
              type="time"
              id="dueTime"
              name="dueTime"
              value={formData.dueTime}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="groupstatus">Type *</label>
            <select
              id="groupstatus"
              name="groupstatus"
              value={formData.groupstatus}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option value="individual">Individual</option>
              <option value="group">Group</option>
            </select>
          </div>

          {formData.groupstatus === "group" && (
            <div className="form-group">
              <label htmlFor="groupId">Group *</label>
              {loadingGroups ? (
                <div>Loading groups...</div>
              ) : (
                <select
                  id="groupId"
                  name="groupId"
                  value={formData.groupId}
                  onChange={handleChange}
                >
                  <option value="">Select Group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="courseId">Course *</label>
            {loadingCourses ? (
              <div>Loading courses...</div>
            ) : (
              <select
                id="courseId"
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code || ""}
                    {c.code && c.name ? " - " : ""}
                    {c.name || ""}
                  </option>
                ))}
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskForm;
