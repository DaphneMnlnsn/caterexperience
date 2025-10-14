import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function EditFoodModal({ show, onClose, onSave, food }) {
  const [formData, setFormData] = useState({
    food_name: '',
    food_description: '',
    food_type: '',
    is_halal: false,
    food_status: '',
    existingImages: [],
    newImages: [],
    newPreviews: [],
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (food) {
      setFormData({
        food_name: food.food_name || '',
        food_description: food.food_description || '',
        food_type: food.food_type || '',
        is_halal: food.is_halal ?? false,
        food_status: food.food_status || '',
        existingImages: food.images?.length
          ? [`${process.env.REACT_APP_BASE_URL}/${food.images[0]}`]
          : [],
        newImage: null,
        newPreview: null,
      });
      setIsEditing(false);
    }
  }, [food]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        Swal.fire('Invalid', 'Image must be JPG, PNG, or WEBP.', 'warning');
        return;
      }

      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        Swal.fire('Invalid', 'Image must be less than 2MB.', 'warning');
        return;
      }

      const preview = URL.createObjectURL(file);

      setFormData(prev => ({
        ...prev,
        newImage: file,
        newPreview: preview,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { food_name, food_description, food_type, newImage } = formData;

    if (food_name.trim() === '' || food_type.trim() === '') {
      Swal.fire('Incomplete', 'Please fill in the required fields: Food Name and Food Type.', 'warning');
      return;
    }

    if (food_name.length < 3) {
      Swal.fire('Invalid', 'Food name must be at least 3 characters.', 'warning');
      return;
    }

    if (food_description && food_description.length > 255) {
      Swal.fire('Invalid', 'Description must be less than 255 characters.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Save Changes?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = new FormData();
        payload.append('food_name', formData.food_name);
        payload.append('food_description', formData.food_description);
        payload.append('food_type', formData.food_type);
        payload.append('food_status', formData.food_status);
        payload.append('is_halal', formData.is_halal ? 1 : 0);
        payload.append('delete_image', formData.existingImages.length === 0 ? 1 : 0);

        if (formData.newImage) {
          payload.append('food_image', formData.newImage);
        }

        axiosClient.post(`/foods/${food.food_id}?_method=PUT`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
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
            Swal.fire('Error', 'There was a problem deleting the food. It may be currently linked to one or more event records.', 'error');
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
            value={formData.food_description}
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

          <label>Food Image</label>
          <div className="image-upload-container">
          {(formData.existingImages.length > 0 || formData.newPreview) && (
            <div className="preview-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <img
                  src={formData.newPreview || formData.existingImages[0]}
                  alt="Food Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                  }}
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        newImage: null,
                        newPreview: null,
                        existingImages: [],
                      }))
                    }
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      backgroundColor: '#ff4d4d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      lineHeight: '22px',
                      textAlign: 'center',
                      boxShadow: '0 0 2px rgba(0,0,0,0.3)',
                    }}
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {isEditing && (
            <>
              <input
                type="file"
                name="food_image"
                id="food-image-upload"
                accept="image/*"
                onChange={handleChange}
                hidden
              />
              <label htmlFor="food-image-upload" className="food-import-btn">
                Import Picture
              </label>
            </>
          )}
        </div>


          <label>Status</label>
          <select
            name="food_status"
            value={formData.food_status}
            onChange={handleChange}
            disabled={!isEditing}
          >
            <option value="available">Available</option>
            <option value="archived">Archived</option>
          </select>

          <label className="halal-label">
            {!isEditing ? (
              <div className="halal-status-display">
                Halal Status:{' '}
                <span className={formData.is_halal ? 'halal-yes' : 'halal-no'}>
                  {formData.is_halal ? '✅ Halal' : '❌ Not Halal'}
                </span>
              </div>
            ) : (
              <>
                <input
                  type="checkbox"
                  name="is_halal"
                  checked={formData.is_halal}
                  onChange={handleChange}
                />
                Mark as Halal
              </>
            )}
          </label>

          <div className="modal-buttons">
            <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>

            {!isEditing ? (
              <button type="button" className="user-save-btn" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            ) : (
              <>
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

export default EditFoodModal;