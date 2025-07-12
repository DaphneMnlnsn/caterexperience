import React from 'react';
import Swal from 'sweetalert2';
import './AddUserModal.css';
import axiosClient from '../axiosClient';

function AddTaskModal({ show, onClose, onSave, bookingId, creatorId, staffOptions }) {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    priority: '',
    due_date: '',
    assigned_to: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const isFormValid = formData.title && formData.priority && formData.due_date && formData.assigned_to;
    if (!isFormValid) {
      Swal.fire('Incomplete', 'Please fill in all required fields.', 'warning');
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
        <form className="add-user-form" onSubmit={handleSubmit}>
          <label>Task Title</label>
          <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          <label>Description</label>
          <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

          <label>Priority</label>
          <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
            <option value="">Select Priority</option>
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>

          <label>Due Date</label>
          <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} />

          <label>Assign To</label>
          <select value={formData.assigned_to} onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}>
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
