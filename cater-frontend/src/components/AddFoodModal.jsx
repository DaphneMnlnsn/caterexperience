import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function AddFoodModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    food_name: '',
    food_description: '',
    food_type: '',
    is_halal: false,
    imageFiles: [],
    imagePreviews: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === 'images') {
      const file = files[0];

      if (!file) return;

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        Swal.fire('Invalid', 'Only JPG, PNG, or WEBP files are allowed.', 'warning');
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
        imageFiles: [file],
        imagePreviews: [preview]
      }));
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleRemoveImage = () => {
    formData.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setFormData(prev => ({
      ...prev,
      imageFiles: [],
      imagePreviews: []
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { food_name, food_type, food_description, imageFiles } = formData;

    if (!food_name.trim() || !food_type.trim()) {
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

    const payload = new FormData();
    payload.append('food_name', formData.food_name);
    payload.append('food_description', formData.food_description);
    payload.append('food_type', formData.food_type);
    payload.append('food_status', 'available');
    payload.append('is_halal', formData.is_halal ? 1 : 0);
    if (formData.imageFiles.length > 0) {
      payload.append('food_image', formData.imageFiles[0]);
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this food item?',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, save it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.post('/foods', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
          .then((res) => {
            Swal.fire('Saved!', 'Food has been added.', 'success');
            onSave(res.data.food);
            onClose();
            setFormData({
              food_name: '',
              food_description: '',
              food_type: '',
              is_halal: false,
              imageFiles: [],
              imagePreviews: []
            });
          })
          .catch((err) => {
            console.error('Error:', err.response?.data || err.message);
            Swal.fire('Error', 'There was a problem saving the food.', 'error');
          });
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <h2>Add Food</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-form">
          <label>Food Name</label>
          <input
            type="text"
            name="food_name"
            value={formData.food_name}
            onChange={handleChange}
          />

          <label>Description</label>
          <textarea
            name="food_description"
            value={formData.food_description}
            onChange={handleChange}
          />

          <label>Food Type</label>
          <select name="food_type" value={formData.food_type} onChange={handleChange}>
            <option value="">Select type</option>
            <option value="Beef">Beef</option>
            <option value="Pork">Pork</option>
            <option value="Chicken">Chicken</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Pasta or Fish">Pasta or Fish</option>
            <option value="Dessert">Dessert</option>
          </select>

          <label className="halal-label">
            <input
              type="checkbox"
              name="is_halal"
              checked={formData.is_halal}
              onChange={handleChange}
            />
            Mark as Halal
          </label>

          <label>Food Image</label>
          <div className="image-upload-container">
            <input
              type="file"
              name="images"
              id="food-image-upload"
              accept="image/*"
              onChange={handleChange}
              hidden
            />
            <label htmlFor="food-image-upload" className="food-import-btn">
              Import Picture
            </label>

            {formData.imagePreviews.length > 0 && (
              <div
                className="preview-container"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '0.75rem'
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px'
                  }}
                >
                  <img
                    src={formData.imagePreviews[0]}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #ccc'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
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
                      boxShadow: '0 0 2px rgba(0,0,0,0.3)'
                    }}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-buttons">
            <button type="button" className="user-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="user-save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFoodModal;
