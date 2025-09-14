import React, {useEffect} from 'react';
import './TaskBoard.css';
import { FaCalendarAlt, FaCheckCircle, FaUser, FaEllipsisV } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axiosClient from '../axiosClient';
import EditTaskModal from './EditTaskModal';

function TaskBoard({ tasks, setTasks, assignedStaffs, staffOptions }) {
  const columns = ['To-Do', 'In-Progress', 'Done'];
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [showEditModal, setShowEditModal] = React.useState(false);

  const groupedTasks = columns.reduce((acc, column) => {
    acc[column] = tasks.filter(task => task.status === column);
    return acc;
  }, {});

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const taskId = parseInt(draggableId);
    const updatedTasks = [...tasks];

    const task = updatedTasks.find(t => t.id === taskId);
    task.status = destination.droppableId;

    const grouped = ['To-Do', 'In-Progress', 'Done'].reduce((acc, col) => {
      acc[col] = updatedTasks.filter(t => t.status === col);
      return acc;
    }, {});
    const reordered = ['To-Do', 'In-Progress', 'Done'].flatMap(col => grouped[col]);
    setTasks(reordered);

    try {
      await axiosClient.put(`/tasks/${taskId}/status`, { status: destination.droppableId });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="task-board">
        {columns.map(status => (
          <Droppable droppableId={status} key={status}>
            {(provided) => (
              <div
                className="task-column"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div className="column-header">
                  <h4>{status}</h4>
                  <span className="status-count">{groupedTasks[status].length}</span>
                  {status === 'Done' && <FaCheckCircle className="status-check" />}
                </div>

                {groupedTasks[status].map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        className={`task-card ${status} ${snapshot.isDragging ? 'dragging' : ''}
                        ${status !== 'Done' && new Date(task.deadline) < new Date() ? 'overdue' : ''}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className="card-header">
                          <strong>{task.task_name}</strong>
                          <FaEllipsisV
                            className="options-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(task);
                              setShowEditModal(true);
                            }}
                          />
                        </div>
                        <div className="card-body">
                          <div className="date-row">
                            <FaCalendarAlt className="icon calendar-icon" />
                            <span className="date-text">
                              {new Date(task.deadline).toLocaleString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="booking-id">✔ {task.booking_ref}</div>
                          <div className="assigned-row">
                            <FaUser className="icon user-icon" />
                            <span className="assignee-name">{task.assigned_to_name}</span>
                          </div>
                        </div>
                        {status === 'Done' && <FaCheckCircle className="done-check" />}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
      {showEditModal && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedTask) => {
            setTasks(prev =>
              prev.map(t => (t.id === updatedTask.id ? updatedTask : t))
            );
            setShowEditModal(false);
          }}
          assignedStaffs={assignedStaffs}
          staffOptions={staffOptions}
        />
      )}
    </DragDropContext>
  );
}

export default TaskBoard;
