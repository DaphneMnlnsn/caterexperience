import React, { useState } from 'react';
import './AddUserModal.css';
import axiosClient from '../axiosClient';
import Swal from 'sweetalert2';

function EditTaskModal({ task, onClose, onUpdate, staffOptions = [], isAdmin, currentUserId}) {
    const [formData, setFormData] = useState({
        title: task?.task_name || '',
        description: task?.description || '',
        priority: task?.priority || '',
        due_date: task?.deadline
            ? new Date(task.deadline).toISOString().slice(0, 16)
            : '',
        assigned_to: task?.assignee?.id || '',
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
            {(isAdmin || task.created_by == currentUserId) ? (
                <h2>Edit Task</h2>
                ) : (
                <h2>Task</h2>
            )}
            <form className="add-form" onSubmit={handleSubmit}>
            <label>Title</label>
            <input
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                disabled={!isAdmin && task.created_by !== currentUserId}
            />

            <label>Description</label>
            <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                disabled={!isAdmin && task.created_by !== currentUserId}
            />

            <label>Due Date & Time</label>
            <input
                type="datetime-local"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                disabled={!isAdmin && task.created_by !== currentUserId}
            />

            <label>Assigned To </label>
            <select
                value={formData.assigned_to}
                onChange={e => setFormData({ ...formData, assigned_to: e.target.value })} disabled={!isAdmin}
            >
                <option value="">Unassigned</option>
                {staffOptions.map(staff => (
                <option key={staff.id} value={staff.id}>
                    {`${toTitle(staff.role)} – ${staff.name}`}
                </option>
                ))}
                disabled={!isAdmin && task.created_by !== currentUserId}
            </select>

            <div className="modal-buttons">
                {(isAdmin || task.created_by == currentUserId) && (
                    <>
                        <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="button" className="user-delete-btn" onClick={handleDelete}>Delete</button>
                        <button type="submit" className="user-save-btn">Save</button>
                    </>
                )}
            </div>
            </form>
        </div>
        </div>
    );
}

export default EditTaskModal;
