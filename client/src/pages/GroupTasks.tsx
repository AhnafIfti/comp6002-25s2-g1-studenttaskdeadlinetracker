import React from 'react';
import './GroupTasks.css';

const GroupTasks: React.FC = () => {
  // Example group task data
  const groupTasks: { id: number; title: string; dueDate: string; status: string }[] = []; // Empty array to simulate no tasks

  return (
    <div className="group-tasks-page">
      <h1>Group Tasks</h1>
      {groupTasks.length === 0 ? (
        <p className="no-tasks-message">No tasks available. Enjoy your free time!</p>
      ) : (
        <ul className="group-task-list">
          {groupTasks.map((task) => (
            <li key={task.id} className="group-task-item">
              <div className="group-task-info">
                <h2 className="group-task-title">{task.title}</h2>
                <p className="group-task-due-date">Due: {task.dueDate}</p>
              </div>
              <div className={`group-task-status ${task.status.toLowerCase().replace(' ', '-')}`}>
                {task.status}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupTasks;