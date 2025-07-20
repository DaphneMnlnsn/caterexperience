import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function EditItemModal({ show, onClose, onSave, item }) {
  const [formData, setFormData] = useState({
    item_name: '',
    item_type: '',
    item_description: '',
    item_quantity: '',
    item_current_quantity: '',
    item_price: '',
    item_unit: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        item_name: item.item_name || '',
        item_type: item.item_type || '',
        item_description: item.item_description || '',
        item_quantity: item.item_quantity || '',
        item_current_quantity: item.item_current_quantity || '',
        item_price: item.item_price || '',
        item_unit: item.item_unit || ''
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { item_name, item_type, item_quantity, item_price, item_unit } = formData;
    if (item_name.trim() === '' || item_type.trim() === '' || item_quantity === '' || item_price === ''|| item_unit.trim() === '') {
      Swal.fire('Incomplete', 'Please fill in all the fields.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save changes to this item?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonColor: '#aaa',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.put(`/inventory/${item.item_id}`, formData)
          .then((res) => {
            Swal.fire('Updated!', 'Item has been updated successfully.', 'success');
            onSave(res.data);
            onClose();
          })
          .catch((err) => {
            console.error('Update error:', err.response?.data || err.message);
            Swal.fire('Error', 'There was a problem updating the item.', 'error');
          });
      }
    });
  };

  if (!show || !item) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <h2>Edit Item</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="add-form">
          <label>Category</label>
          <select name="item_type" value={formData.item_type} onChange={handleChange}>
            <option value="">Select category</option>
            <option value="Furniture">Furniture</option>
            <option value="Utensil">Utensil</option>
            <option value="Decoration">Decoration</option>
          </select>

          <label>Item Name</label>
          <input
            type="text"
            name="item_name"
            value={formData.item_name}
            onChange={handleChange}
          />

          <div className="name-row">
            <div className="half">
              <label>Total Quantity</label>
              <input
                type="number"
                name="item_quantity"
                value={formData.item_quantity}
                onChange={handleChange}
              />
            </div>
            <div className="half">
              <label>Current Quantity</label>
              <input
                type="number"
                name="item_current_quantity"
                value={formData.item_current_quantity}
                onChange={handleChange}
              />
            </div>
          </div>

          <label>Description</label>
          <textarea
            name="item_description"
            value={formData.item_description}
            onChange={handleChange}
          />

          <div className="name-row">
            <div className="half">
              <label>Price</label>
              <input
                type="number"
                name="item_price"
                value={formData.item_price}
                onChange={handleChange}
              />
            </div>
            <div className="half">
              <label>Unit</label>
              <select name="item_unit" value={formData.item_unit} onChange={handleChange}>
                <option value="">Select type</option>
                <option value="piece">piece</option>
                <option value="set">set</option>
              </select>
            </div>
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

export default EditItemModal;