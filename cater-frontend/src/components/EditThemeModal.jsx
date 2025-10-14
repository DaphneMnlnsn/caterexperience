import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function EditThemeModal({ show, onClose, onSave, onDelete, theme }) {
  const [formData, setFormData] = useState({
    theme_name: '',
    description: '',
    imageFiles: [],
    imagePreviews: [],
    theme_status: ''
  });

  useEffect(() => {
    if (theme) {
      setFormData({
        theme_name: theme.theme_name || '',
        description: theme.theme_description || '',
        imageFiles: [],
        imagePreviews: theme.images
        ? theme.images.map(img => ({
            id: img.image_id,
            url: `${process.env.REACT_APP_BASE_URL}/${img.image_url}`
          }))
        : [],
        deletedImageIds: [],
        theme_status: theme.theme_status || ''
      });
    }
  }, [theme]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'images') {
      const filesArray = Array.from(files);
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 2 * 1024 * 1024;

      const validFiles = filesArray.filter(file => {
        if (!validTypes.includes(file.type)) {
          Swal.fire('Invalid', `${file.name} must be JPG, PNG, or WEBP.`, 'warning');
          return false;
        }
        if (file.size > maxSize) {
          Swal.fire('Invalid', `${file.name} must be less than 2MB.`, 'warning');
          return false;
        }
        return true;
      });

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            imageFiles: [...prev.imageFiles, file],
            imagePreviews: [...prev.imagePreviews, reader.result],
          }));
        };
        reader.readAsDataURL(file);
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const removed = prev.imagePreviews[index];
      const isExisting = removed.id;
      return {
        ...prev,
        imageFiles: prev.imageFiles.filter((_, i) => i !== index),
        imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
        deletedImageIds: isExisting
          ? [...prev.deletedImageIds, removed.id]
          : prev.deletedImageIds
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { theme_name, description } = formData;

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

    if (formData.imageFiles.length === 0 && formData.imagePreviews.length === 0) {
      Swal.fire('Incomplete', 'Please upload at least one image.', 'warning');
      return;
    }

    const payload = new FormData();
    payload.append('theme_name', formData.theme_name);
    payload.append('theme_description', formData.description);
    payload.append('theme_status', formData.theme_status);
    formData.imageFiles.forEach(file => payload.append('theme_images[]', file));
    formData.deletedImageIds.forEach(id =>
      payload.append('deleted_images[]', id)
    );

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
            Swal.fire('Error', 'There was a problem deleting the theme. It may be currently linked to one or more event records.', 'error');
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

          <label>Images</label>
          <div className="image-upload-container">
            <input
              type="file"
              name="images"
              id="image-upload"
              accept="image/*"
              multiple
              onChange={handleChange}
              hidden
            />
            <label htmlFor="image-upload" className="food-import-btn">Import Pictures</label>

            <div className="image-preview-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '0.5rem' }}>
              {formData.imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    width: '100px',
                    height: '100px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  <img 
                    src={preview.url || preview} 
                    alt={`Preview ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      lineHeight: '22px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
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
