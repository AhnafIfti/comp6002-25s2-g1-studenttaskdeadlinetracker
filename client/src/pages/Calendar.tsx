import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './Calendar.css';
import 'react-calendar/dist/Calendar.css';

// Define date type
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const TaskCalendar: React.FC = () => {
  const [value, setValue] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<any[]>([]); // Store all tasks
  const [selectedTask, setSelectedTask] = useState<any | null>(null); // Currently selected task
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility

  // Fetch all task data from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tasks/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTasks(data); // Store tasks in state
        } else {
          console.error('Failed to fetch tasks');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []); // Only call once when the component loads

  // Customize the content of each date cell
  const tileContent = ({ date }: { date: Date }) => {
    const tasksForDate = tasks.filter(
      (t) => new Date(t.dueDate).toDateString() === date.toDateString()
    );

    return tasksForDate.length > 0 ? (
      <div className="tile-content">
        {tasksForDate.map((task, index) => (
          <div
            key={index}
            className="task-item"
            onClick={(e) => {
              e.stopPropagation(); 
              setSelectedTask(task); // Set the selected task
              setIsModalOpen(true); // Open the modal
            }}
          >
            {task.title}
          </div>
        ))}
      </div>
    ) : null;
  };

  // Handle date change
  const handleDateChange = (newValue: Value): void => {
    if (newValue instanceof Date) {
      setValue(newValue);
    }
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="modern-calendar-container">
      <Calendar
        value={value}
        onChange={handleDateChange}
        tileContent={tileContent}
        locale="en-US"
        className="custom-calendar"
        view="month"
        showNeighboringMonth={true}
      />

      {/* Modal */}
      {isModalOpen && selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={closeModal}>
              &times;
            </button>
            <h2>{selectedTask.title}</h2>
            <p><strong>Description:</strong> {selectedTask.description}</p>
            <p><strong>Due Date:</strong> {new Date(selectedTask.dueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}</p>
            <p><strong>Due Time:</strong> {selectedTask.dueTime}</p>
            <p><strong>Status:</strong> {selectedTask.status}</p>
            <p><strong>Course Code:</strong> {selectedTask.courseCode || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCalendar;