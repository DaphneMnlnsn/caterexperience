import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function EditFoodModal({ show, onClose, onSave, food }) {
  const [formData, setFormData] = useState({
    food_name: '',
    food_description: '',
    food_type: '',
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (food) {
      setFormData({
        food_name: food.food_name || '',
        food_description: food.food_description || '',
        food_type: food.food_type || '',
      });
      setIsEditing(false);
    }
  }, [food]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { food_name, food_type } = formData;
    if (food_name.trim() === '' || food_type.trim() === '') {
      Swal.fire('Incomplete', 'Please fill in the required fields.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Save Changes?',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.put(`/foods/${food.food_id}`, {
          ...formData,
          food_status: 'available'
        })
        .then(() => {
          Swal.fire('Saved!', 'Food has been updated.', 'success');
          onSave();
          onClose();
        })
        .catch((err) => {
          console.error('Update Error:', err.response?.data || err.message);
          Swal.fire('Error', 'Failed to update food.', 'error');
        });
      }
    });
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'Delete Food?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.delete(`/foods/${food.food_id}`)
        .then(() => {
          Swal.fire('Deleted!', 'Food item has been removed.', 'success');
          onSave();
          onClose();
        })
        .catch((err) => {
          console.error('Delete Error:', err.response?.data || err.message);
          Swal.fire('Error', 'Failed to delete food.', 'error');
        });
      }
    });
  };

  if (!show || !food) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Food' : 'Food Details'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-form food-form">
          <label>Food Name</label>
          <input
            type="text"
            name="food_name"
            value={formData.food_name}
            onChange={handleChange}
            disabled={!isEditing}
          />

          <label>Description</label>
          <textarea
            name="food_description"
            value={formData.food_description || 'N/A'}
            onChange={handleChange}
            disabled={!isEditing}
          />

          <label>Food Type</label>
          <select
            name="food_type"
            value={formData.food_type}
            onChange={handleChange}
            disabled={!isEditing}
          >
            <option value="">Select type</option>
            <option value="Beef">Beef</option>
            <option value="Pork">Pork</option>
            <option value="Chicken">Chicken</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Pasta or Fish">Pasta or Fish</option>
            <option value="Dessert">Dessert</option>
          </select>

          <div className="modal-buttons">
            <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>

            {!isEditing ? (
              <button type="button" className="user-save-btn" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="user-delete-btn"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button type="submit" className="user-save-btn">Save</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditFoodModal;