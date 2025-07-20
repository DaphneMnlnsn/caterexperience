import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function AddAddonModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    addon_name: '',
    addon_type: '',
    addon_description: '',
    addon_price: '',
    addon_status: 'active',
    prices: [
      { description: '', price: '' }
    ]
  });

  const handleChange = (e, index, field) => {
    const { name, value } = e.target;

    if (field !== undefined) {
      const updatedPrices = [...formData.prices];
      updatedPrices[index][field] = value;
      setFormData({ ...formData, prices: updatedPrices });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addPriceRow = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { description: '', price: '' }]
    }));
  };

  const removePriceTier = (index) => {
    const updated = formData.prices.filter((_, i) => i !== index);
    setFormData({ ...formData, prices: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isFormValid =
      formData.addon_name.trim() !== '' &&
      formData.addon_type.trim() !== '' &&
      formData.addon_status.trim() !== '' &&
      formData.prices.length > 0 &&
      formData.prices.every(p => p.description.trim() !== '' && p.price.toString().trim() !== '');

    if (!isFormValid) {
      Swal.fire('Incomplete', 'Please fill in all the fields.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this addon?',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.post('/addons', formData)
          .then((res) => {
            Swal.fire('Saved!', 'Addon has been added.', 'success');
            onSave(res.data.addon);
            onClose();
          })
          .catch((err) => {
            console.error('Error:', err.response?.data || err.message);
            Swal.fire('Error', 'There was a problem saving the addon.', 'error');
          });
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <h2>Add Addon</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="add-form">
          <label>Addon Name</label>
          <input
            type="text"
            name="addon_name"
            value={formData.package_name}
            onChange={handleChange}
          />

          <label>Addon Type</label>
          <select name="addon_type" value={formData.addon_type} onChange={handleChange}>
            <option value="">Select type</option>
            <option value="Lights and Sounds">Lights and Sounds</option>
            <option value="Pica Pica">Pica Pica</option>
            <option value="Snacks">Snacks</option>
            <option value="Photobooth">Photobooth</option>
            <option value="Backdrop">Backdrop</option>
            <option value="Cake">Cake</option>
            <option value="Dessert Buffet">Dessert Buffet</option>
            <option value="Clown">Clown</option>
            <option value="Magician">Magician</option>
            <option value="Other">Other</option>
          </select>

          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          {formData.prices.map((entry, index) => (
            <div className="name-row" key={index}>
              <div className="half">
                <label>{index === 0 ? 'Description' : ''}</label>
                <input
                  type="text"
                  placeholder="e.g. 3 gallons, 3 flavors"
                  value={entry.description}
                  onChange={(e) => handleChange(e, index, 'description')}
                />
              </div>
              <div className="half">
                <label>{index === 0 ? 'Price' : ''}</label>
                <input
                  type="number"
                  name="Price"
                  value={entry.price}
                  onChange={(e) => handleChange(e, index, 'price')}
                />
              </div>
              {formData.prices.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePriceTier(index)}
                  style={{ marginLeft: '8px', color: 'red', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <div className="plus-box" onClick={addPriceRow}>+</div>

          <div className="modal-buttons">
            <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="user-save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAddonModal;
