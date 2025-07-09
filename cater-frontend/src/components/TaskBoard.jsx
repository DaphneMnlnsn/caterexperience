import React from 'react';
import './TaskBoard.css';
import { FaCalendarAlt, FaCheckCircle, FaUser, FaEllipsisV } from 'react-icons/fa';

function TaskBoard({ tasks }) {
  const columns = ['To-Do', 'In-Progress', 'Done'];

  const getStatusCount = (status) =>
    tasks.filter(task => task.status === status).length;

  const getCardClass = (status) => {
    switch (status) {
      case 'To-Do': return 'card-todo';
      case 'In-Progress': return 'card-inprogress';
      case 'Done': return 'card-done';
      default: return '';
    }
  };

  return (
    <div className="task-board">
      {columns.map(status => (
        <div className="task-column" key={status}>
          <div className="column-header">
            <h4>{status}</h4>
            <span className="status-count">{getStatusCount(status)}</span>
            {status === 'Done' && <FaCheckCircle className="status-check" />}
          </div>
          {tasks.filter(task => task.status === status).map(task => (
            <div key={task.id} className={`task-card ${getCardClass(status)}`}>
              <div className="card-header">
                <strong>{task.task_name}</strong>
                <FaEllipsisV className="options-icon" />
              </div>
              <div className="card-body">
                <div className="date-row">
                  <FaCalendarAlt className="icon calendar-icon" />
                  <span className="date-text">{new Date(task.deadline).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}</span>
                </div>
                <div className="booking-id">✔ {task.booking_ref}</div>
                <div className="assigned-row">
                  <FaUser className="icon user-icon" />
                  <span className="assignee-name">{task.assigned_to_name}</span>
                </div>
              </div>
              {status === 'Done' && <FaCheckCircle className="done-check" />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default TaskBoard;
