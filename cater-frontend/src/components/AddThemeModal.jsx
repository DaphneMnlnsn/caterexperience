import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function AddThemeModal({ show, onClose, onSave }) {
  
  const [formData, setFormData] = useState({
    theme_name: '',
    description: '',
    imageFile: null,
    imagePreview: ''
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            imageFile: file,
            imagePreview: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.theme_name.trim() || !formData.imageFile) {
      Swal.fire('Incomplete', 'Please fill in all the fields and upload an image.', 'warning');
      return;
    }

    const payload = new FormData();
    payload.append('theme_name', formData.theme_name);
    payload.append('theme_description', formData.description);
    payload.append('theme_status', 'active');
    payload.append('theme_image', formData.imageFile);

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this theme?',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.post('/themes', payload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        })
          .then((res) => {
            Swal.fire('Saved!', 'Theme has been added.', 'success');
            onSave(res.data.theme);
            onClose();
          })
          .catch((err) => {
            console.error('Error:', err.response?.data || err.message);
            Swal.fire('Error', 'There was a problem saving the theme.', 'error');
          });
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <h2>Add Theme</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="add-form">
          <label>Theme Name</label>
          <input
            type="text"
            name="theme_name"
            value={formData.theme_name}
            onChange={handleChange}
          />

          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <label>Image</label>
          <div className="image-upload-container">
            <input
              type="file"
              name="image"
              id="image-upload"
              accept="image/*"
              onChange={handleChange}
              hidden
            />
            <label htmlFor="image-upload" className="food-import-btn">Import Picture</label>
            {formData.imagePreview && (
              <img
                src={formData.imagePreview}
                alt="Preview"
                style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '0.5rem' }}
              />
            )}
          </div>

          <div className="modal-buttons">
            <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="user-save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddThemeModal;
