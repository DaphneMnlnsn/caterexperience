import React from 'react';
import './TaskBoard.css';

function TaskBoard({ tasks }) {
  const columns = ['To-Do', 'In-Progress', 'Done'];

  return (
    <div className="task-board">
      {columns.map(status => (
        <div className="task-column" key={status}>
          <h4>{status}</h4>
          {tasks.filter(task => task.status === status).map(task => (
            <div key={task.id} className="task-card">
              <p>{task.task_name}</p>
              <p className="due-date">📅 {new Date(task.deadline).toLocaleString()}</p>
              <p className="assigned-to">👤 {task.assigned_to_name}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default TaskBoard;
