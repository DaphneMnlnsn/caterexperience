import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function AddPackageModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    package_name: '',
    description: '',
    prices: [{ price: '', pax: '' }]
  });

  const handleChange = (e, index, field) => {
    const { name, value } = e.target;

    if (field) {
      const updatedPrices = [...formData.prices];
      updatedPrices[index][field] = value;
      setFormData({ ...formData, prices: updatedPrices });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addPricePaxRow = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { price: '', pax: '' }]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { package_name, description, prices } = formData;
    const isFormValid =
      package_name.trim() !== '' &&
      description.trim() !== '' &&
      prices.every(p => p.price.trim() !== '' && p.pax.trim() !== '');

    if (!isFormValid) {
      Swal.fire('Incomplete', 'Please fill in all the fields.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this package?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f7e26b',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.post('/packages', formData)
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
        <form onSubmit={handleSubmit} className="add-user-form">
          <label>Package Name</label>
          <input
            type="text"
            name="package_name"
            value={formData.package_name}
            onChange={handleChange}
          />

          <label>Description/Inclusions</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          {formData.prices.map((entry, index) => (
            <div className="name-row" key={index}>
              <div className="half">
                <label>{index === 0 ? 'Price' : ''}</label>
                <input
                  type="number"
                  name="price"
                  value={entry.price}
                  onChange={(e) => handleChange(e, index, 'price')}
                />
              </div>
              <div className="half">
                <label>{index === 0 ? 'Pax.' : ''}</label>
                <input
                  type="number"
                  name="pax"
                  value={entry.pax}
                  onChange={(e) => handleChange(e, index, 'pax')}
                />
              </div>
            </div>
          ))}

          <div className="plus-box" onClick={addPricePaxRow}>+</div>

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
