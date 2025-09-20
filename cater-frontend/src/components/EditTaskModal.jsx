import React, { useState } from 'react';
import './AddUserModal.css';
import axiosClient from '../axiosClient';
import Swal from 'sweetalert2';

function EditTaskModal({ task, onClose, onUpdate, staffOptions = [] }) {
    const [formData, setFormData] = useState({
        title: task?.task_name || '',
        description: task?.description || '',
        priority: task?.priority || '',
        due_date: task?.deadline?.slice(0, 10) || '',
        assigned_to: task?.assignee?.id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const { title, priority, due_date, assigned_to, description } = formData;
        
        if (!title.trim() || !priority || !due_date || !assigned_to) {
            Swal.fire('Incomplete', 'Please fill in all required fields.', 'warning');
            return;
        }
    
        if (title.length < 3) {
            Swal.fire('Invalid', 'Task title must be at least 3 characters.', 'warning');
            return;
        }
    
        if (description && description.length < 255) {
            Swal.fire('Invalid', 'Task description must be less than 255 characters.', 'warning');
            return;
        }
    
        const today = new Date();
        const dueDate = new Date(due_date);
        if (dueDate < today.setHours(0,0,0,0)) {
            Swal.fire('Invalid', 'Due date cannot be in the past.', 'warning');
            return;
        }
    
        if (!staffOptions.some(staff => staff.id.toString() === assigned_to.toString())) {
            Swal.fire('Invalid', 'Please select a valid staff member.', 'warning');
            return;
        }

        axiosClient.put(`/tasks/${task.id}`, {
        ...formData,
        status: task.status,
        })
        .then(() => {
            Swal.fire('Success!', 'Task updated successfully.', 'success').then(() => {
                onUpdate({ ...task, ...formData });
                onClose();
                window.location.reload();
            });
        })
        .catch(err => {
            console.error('Failed to update task:', err);
            Swal.fire('Error', 'Failed to update task.', 'error');
        });
    };

    const handleDelete = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the task.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then(result => {
            if (result.isConfirmed) {
            axiosClient.delete(`/tasks/${task.id}`)
                .then(() => {
                Swal.fire('Deleted!', 'Task has been deleted.', 'success').then(() => {
                    onClose();
                    window.location.reload();
                });
                })
                .catch(err => {
                console.error('Failed to delete task:', err);
                Swal.fire('Error', 'Failed to delete task.', 'error');
                });
            }
        });
    };

    const toTitle = (str) =>
    typeof str === 'string' && str.length > 0
        ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
        : '';

    return (
        <div className="modal-overlay">
        <div className="modal">
            <button className="modal-close" onClick={onClose}>×</button>
            <h2>Edit Task</h2>
            <form className="add-form" onSubmit={handleSubmit}>
            <label>Title</label>
            <input
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
            />

            <label>Description</label>
            <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
            />

            <label>Due Date</label>
            <input
                type="date"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
            />

            <label>Priority</label>
            <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
            >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
            </select>

            <label>Assigned To</label>
            <select
                value={formData.assigned_to}
                onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
            >
                <option value="">Unassigned</option>
                {staffOptions.map(staff => (
                <option key={staff.id} value={staff.id}>
                    {`${toTitle(staff.role)} – ${staff.name}`}
                </option>
                ))}
            </select>

            <div className="modal-buttons">
                <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>
                <button type="button" className="user-delete-btn" onClick={handleDelete}>Delete</button>
                <button type="submit" className="user-save-btn">Save</button>
            </div>
            </form>
        </div>
        </div>
    );
}

export default EditTaskModal;
