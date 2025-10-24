import React from 'react';
import Swal from 'sweetalert2';
import './AddUserModal.css';
import axiosClient from '../axiosClient';

function AddTaskModal({ show, onClose, onSave, bookingId, creatorId, staffOptions, isAdmin, currentUserId }) {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    priority: 'Low',
    due_date: '',
    assigned_to: isAdmin ? '' : currentUserId,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const { title, due_date, assigned_to, description } = formData;

    if (!title.trim() || !due_date || !assigned_to) {
      Swal.fire('Incomplete', 'Please fill in all required fields.', 'warning');
      return;
    }

    if (title.length < 3) {
      Swal.fire('Invalid', 'Task title must be at least 3 characters.', 'warning');
      return;
    }

    if (description && description.length > 255) {
      Swal.fire('Invalid', 'Task description must be less than 255 characters.', 'warning');
      return;
    }

    const now = new Date();
    const dueDate = new Date(due_date);

    if (dueDate < now) {
      Swal.fire('Invalid', 'Due date/time cannot be in the past.', 'warning');
      return;
    }


    if (!staffOptions.some(staff => staff.id.toString() === assigned_to.toString())) {
      Swal.fire('Invalid', 'Please select a valid staff member.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Confirm Task',
      text: 'Do you want to add this task?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, add it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.post('/tasks', {
          booking_id: bookingId,
          created_by: creatorId,
          ...formData,
          auto_generated: false,
        })
        .then(res => {
          Swal.fire('Success!', 'Task added successfully.', 'success').then(() => {
            onSave(res.data.task);
            onClose();
            window.location.reload();
          });
        })
        .catch(err => {
          console.error(err.response?.data || err.message);
          Swal.fire('Error', 'Failed to add task.', 'error');
        });
      }
    });
  };

  const toTitle = (str) =>
  typeof str === 'string' && str.length > 0
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : '';

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Add Task</h2>
        <form className="add-form" onSubmit={handleSubmit}>
          <label>Task Title</label>
          <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          <label>Description</label>
          <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

          <label>Due Date & Time</label>
          <input
            type="datetime-local"
            value={formData.due_date}
            onChange={e => setFormData({ ...formData, due_date: e.target.value })}
          />

          <label>Assign To</label>
          <select value={formData.assigned_to} onChange={e => setFormData({ ...formData, assigned_to: e.target.value })} disabled={!isAdmin}>
            <option value="">Select Staff</option>
            {staffOptions.map(staff => (
              <option key={staff.id} value={staff.id}>
                {`${toTitle(staff.role)} – ${staff.name}`}
              </option>
            ))}
          </select>

          <div className="modal-buttons">
            <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="user-save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaskModal;
