import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddTaskForm.css';

interface TaskData {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  groupstatus: string;
  courseId: string;
}

interface AddTaskFormProps {
  onClose: () => void;
  onAddTask: (newTask: TaskData) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onClose, onAddTask }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    groupstatus: '',
    courseCode: '',
  });


  const validateForm = () => {
    let isValid = true;

    if (!formData.title.trim()) {
      toast.error('Title is required.');
      isValid = false;
    }

    if (!formData.dueDate.trim()) {
      toast.error('Due date is required.');
      isValid = false;
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dueDate)) {
      toast.error('Due date must be in MM/DD/YYYY format.');
      isValid = false;
    } else {
      const [month, day, year] = formData.dueDate.split('/').map(Number);
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        toast.error('Due date must have a valid month (1-12) and day (1-31).');
        isValid = false;
      } else {
        const dueDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Ignore time for comparison
        if (isNaN(dueDate.getTime()) || dueDate < today) {
          toast.error('Due date must be a valid future date.');
          isValid = false;
        }
      }
    }

    if (!formData.dueTime.trim()) {
      toast.error('Due time is required.');
      isValid = false;
    }

    if (!formData.groupstatus.trim()) {
      toast.error('Task type is required.');
      isValid = false;
    }

    if (!formData.courseCode.trim()) {
      toast.error('Course code is required.');
      isValid = false;
    }

    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const formattedDueTime = new Date(`1970-01-01T${formData.dueTime}:00`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      try {
        // Fetch courseId based on courseCode
        const courseResponse = await fetch(`http://localhost:5000/api/courses/code/${formData.courseCode}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!courseResponse.ok) {
          const errorData = await courseResponse.json();
          toast.error(`Error: ${errorData.message || 'Invalid course code'}`);
          return;
        }

        const courseData = await courseResponse.json();
        const courseId = courseData.id;

        // Construct newTask with fetched courseId
        const newTask: TaskData = {
          ...formData,
          dueTime: formattedDueTime,
          courseId, // Use fetched courseId
        };

        console.log('Submitting task data:', newTask);

        // Submit task to backend
        const response = await fetch('http://localhost:5000/api/tasks/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(newTask),
        });

        if (response.ok) {
          const result = await response.json();
          onAddTask(result);
          localStorage.setItem('lastTask', JSON.stringify(result));
        } else {
          const errorData = await response.json();
          console.error('Failed to add task:', errorData);
          toast.error(`Error: ${errorData.message || 'Failed to add task'}`);
        }
      } catch (error) {
        console.error('Error while adding task:', error);
        toast.error('An error occurred while adding the task.');
      }
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

          <div className="form-group">
            <label htmlFor="courseCode">Course Code *</label>
            <input
              type="text"
              id="courseCode"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="add-cancel-button">
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