import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function AddPackageModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    package_name: '',
    package_description: '',
    package_type: '',
    package_price: '',
    package_status: 'available',
    price_tiers: [{ price_label: '', price_amount: '', pax: '', status: 'available' }]
  });

  const handleChange = (e, index, field) => {
    const { name, value } = e.target;
    if (field) {
      const updatedTiers = [...formData.price_tiers];
      updatedTiers[index][field] = value;
      setFormData({ ...formData, price_tiers: updatedTiers });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addPriceTier = () => {
    setFormData(prev => ({
      ...prev,
      price_tiers: [...prev.price_tiers, { price_label: '', price_amount: '', pax: '', status: 'available' }]
    }));
  };

  const removePriceTier = (index) => {
    const updated = formData.price_tiers.filter((_, i) => i !== index);
    setFormData({ ...formData, price_tiers: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isFormValid =
      formData.package_name.trim() !== '' &&
      formData.package_type.trim() !== '' &&
      formData.price_tiers.every(t =>
        t.price_label.trim() !== '' &&
        t.price_amount !== '' && !isNaN(Number(t.price_amount)) && Number(t.price_amount) > 0 &&
        t.pax !== '' && !isNaN(Number(t.pax)) && Number(t.pax) > 0
      );

    if (!isFormValid) {
      Swal.fire('Incomplete', 'Please fill in all the fields.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this package?',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          package_name: formData.package_name,
          package_description: formData.package_description || '',
          package_price: formData.package_price ? Number(formData.package_price) : null,
          package_type: formData.package_type || '',
          package_status: formData.package_status,
          price_tiers: formData.price_tiers.map(tier => ({
            price_label: tier.price_label.trim(),
            price_amount: Number(tier.price_amount),
            pax: Number(tier.pax),
            status: tier.status || 'available'
          }))
        };
        
        axiosClient.post('/packages', payload)
          .then((res) => {
            Swal.fire('Saved!', 'Package has been added.', 'success');
            onSave(res.data.package);
            onClose();
          })
          .catch((err) => {
            console.error('Error:', err.response?.data || err.message);
            Swal.fire('Error', 'There was a problem saving the package.', 'error');
          });
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <h2>Add Package</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="add-form">
          <label>Package Name</label>
          <input
            type="text"
            name="package_name"
            value={formData.package_name}
            onChange={handleChange}
          />

          <label>Package Type</label>
          <select
            name="package_type"
            value={formData.package_type}
            onChange={handleChange}
          >
            <option value="">Select Type</option>
            <option value='General'>General</option>
            <option value="Wedding">Wedding</option>
            <option value="Birthday">Birthday</option>
          </select>

          <label>Description/Inclusions</label>
          <textarea
            name="package_description"
            value={formData.package_description}
            onChange={handleChange}
          />

          <label>Base Price (Optional)</label>
          <input
            type="number"
            name="package_price"
            value={formData.package_price || ''}
            onChange={handleChange}
          />

          {formData.price_tiers.map((tier, index) => (
            <div className="name-row" key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <div className="half">
                <input
                  type="text"
                  placeholder="Label (e.g., 50 pax)"
                  value={tier.price_label}
                  onChange={(e) => handleChange(e, index, 'price_label')}
                />
              </div>
              <div className="half">
                <input
                  type="number"
                  placeholder="Amount"
                  value={tier.price_amount}
                  onChange={(e) => handleChange(e, index, 'price_amount')}
                />
              </div>
              <div className="half">
                <input
                  type="number"
                  placeholder="Pax"
                  value={tier.pax}
                  onChange={(e) => handleChange(e, index, 'pax')}
                />
              </div>
              {formData.price_tiers.length > 1 && (
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

          <div className="plus-box" onClick={addPriceTier}>+</div>

          <div className="modal-buttons">
            <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="user-save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPackageModal;
