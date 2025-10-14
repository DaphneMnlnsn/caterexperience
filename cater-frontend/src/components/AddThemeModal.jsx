import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function AddThemeModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    theme_name: '',
    description: '',
    imageFiles: [],
    imagePreviews: []
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'images') {
      const selectedFiles = Array.from(files);
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const invalidFiles = selectedFiles.filter(f => !validTypes.includes(f.type));

      if (invalidFiles.length > 0) {
        Swal.fire('Invalid', 'Some files are not JPG, PNG, or WEBP.', 'warning');
        return;
      }
      if (selectedFiles.size > 2 * 1024 * 1024) {
        Swal.fire('Invalid', 'Image must be less than 2MB.', 'warning');
        return;
      }

      const previews = selectedFiles.map(file => URL.createObjectURL(file));

      setFormData(prev => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...selectedFiles],
        imagePreviews: [...prev.imagePreviews, ...previews]
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const newFiles = [...prev.imageFiles];
      const newPreviews = [...prev.imagePreviews];

      URL.revokeObjectURL(newPreviews[index]);
      newFiles.splice(index, 1);
      newPreviews.splice(index, 1);

      return {
        ...prev,
        imageFiles: newFiles,
        imagePreviews: newPreviews
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { theme_name, description, imageFiles } = formData;

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
    if (imageFiles.length === 0) {
      Swal.fire('Incomplete', 'Please upload at least one image.', 'warning');
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    const oversized = imageFiles.some(file => file.size > maxSize);
    if (oversized) {
      Swal.fire('Invalid', 'Each image must be less than 2MB.', 'warning');
      return;
    }

    const payload = new FormData();
    payload.append('theme_name', formData.theme_name);
    payload.append('theme_description', formData.description);
    payload.append('theme_status', 'available');
    imageFiles.forEach(file => payload.append('theme_images[]', file));

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this theme?',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, save it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.post('/themes', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then((res) => {
          Swal.fire('Saved!', 'Theme has been added.', 'success');
          onSave(res.data.theme);
          onClose();
        })
        .catch((err) => {
          if (err.response && err.response.status === 409) {
            Swal.fire('Duplicate', 'This theme already exists.', 'warning');
          } else {
            console.error('Error:', err.response?.data || err.message);
            Swal.fire('Error', 'There was a problem saving the theme.', 'error');
          }
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
            <label htmlFor="image-upload" className="food-import-btn">
              Import Pictures
            </label>

            {formData.imagePreviews.length > 0 && (
              <div
                className="preview-grid"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginTop: '0.75rem'
                }}
              >
                {formData.imagePreviews.map((src, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      width: '100px',
                      height: '100px'
                    }}
                  >
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid #ccc'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
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
                ))}
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

export default AddThemeModal;
