import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function EditThemeModal({ show, onClose, onSave, onDelete, theme }) {
  const [formData, setFormData] = useState({
    theme_name: '',
    description: '',
    imageFile: null,
    imagePreview: '',
    theme_status: ''
  });

  useEffect(() => {
    if (theme) {
      setFormData({
        theme_name: theme.theme_name || '',
        description: theme.theme_description || '',
        imageFile: null,
        imagePreview: theme.theme_image_url ? `http://localhost:8000/storage/${theme.theme_image_url}` : '',
        theme_status: theme.theme_status || ''
      });
    }
  }, [theme]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            imageFile: file,
            imagePreview: reader.result
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

    const { theme_name, description, imageFile } = formData;
    
    if (!theme_name.trim()) {
      Swal.fire('Incomplete', 'Theme name is required.', 'warning');
      return;
    }

    if (theme_name.length < 3) {
      Swal.fire('Invalid', 'Theme name must be at least 3 characters.', 'warning');
      return;
    }

    if (description && description.length > 255) {
      Swal.fire('Invalid', 'Description must be less than 255 characters.', 'warning');
      return;
    }

    if (!imageFile) {
      Swal.fire('Incomplete', 'Please upload an image.', 'warning');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
      Swal.fire('Invalid', 'Image must be JPG, PNG, or WEBP.', 'warning');
      return;
    }

    const maxSize = 5 * 1024 * 1024; 
    if (imageFile.size > maxSize) {
      Swal.fire('Invalid', 'Image must be less than 5MB.', 'warning');
      return;
    }

    const payload = new FormData();
    payload.append('theme_name', formData.theme_name);
    payload.append('theme_description', formData.description);
    payload.append('theme_status', formData.theme_status);
    if (formData.imageFile) {
      payload.append('theme_image', formData.imageFile);
    }

    Swal.fire({
      title: 'Save Changes?',
      text: 'Do you want to update this theme?',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.post(`/themes/${theme.theme_id}?_method=PUT`, payload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        })
          .then((res) => {
            Swal.fire('Saved!', 'Theme has been updated.', 'success');
            onSave(res.data.theme);
            onClose();
          })
          .catch((err) => {
            console.error(err.response?.data || err.message);
            Swal.fire('Error', 'There was a problem updating the theme.', 'error');
          });
      }
    });
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This theme will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.delete(`/themes/${theme.theme_id}`)
          .then(() => {
            Swal.fire('Deleted!', 'Theme has been deleted.', 'success');
            onSave();
            onClose();
          })
          .catch((err) => {
            console.error(err.response?.data || err.message);
            Swal.fire('Error', 'There was a problem deleting the theme.', 'error');
          });
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <h2>Edit Theme</h2>
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

          <label>Status</label>
          <select
            name="theme_status"
            value={formData.theme_status}
            onChange={handleChange}
          >
            <option value="available">Available</option>
            <option value="archived">Archived</option>
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

export default EditThemeModal;