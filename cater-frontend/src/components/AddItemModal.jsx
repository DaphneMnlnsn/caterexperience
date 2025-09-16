import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function AddItemModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    item_name: '',
    item_type: '',
    item_description: '',
    item_quantity: '',
    item_current_quantity: '',
    item_price: '',
    item_unit: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { item_name, item_type, item_quantity, item_current_quantity, item_price, item_unit, item_description } = formData;

    if (!item_name.trim() || !item_type.trim() || !item_quantity || !item_price || !item_unit.trim()) {
      Swal.fire('Incomplete', 'Please fill in all the required fields.', 'warning');
      return;
    }

    if (item_name.length < 3) {
      Swal.fire('Invalid', 'Item name must be at least 3 characters.', 'warning');
      return;
    }

    if (isNaN(item_quantity) || Number(item_quantity) <= 0) {
      Swal.fire('Invalid', 'Total quantity must be a positive number.', 'warning');
      return;
    }
    if (isNaN(item_current_quantity) || Number(item_current_quantity) < 0) {
      Swal.fire('Invalid', 'Current quantity cannot be negative.', 'warning');
      return;
    }
    if (Number(item_current_quantity) > Number(item_quantity)) {
      Swal.fire('Invalid', 'Current quantity cannot exceed total quantity.', 'warning');
      return;
    }

    if (isNaN(item_price) || Number(item_price) <= 0) {
      Swal.fire('Invalid', 'Price must be a valid positive number.', 'warning');
      return;
    }

    if (item_description && item_description.length > 255) {
      Swal.fire('Invalid', 'Description must be less than 255 characters.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this item?',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          item_name: formData.item_name,
          item_type: formData.item_type,
          item_description: formData.item_description,
          item_quantity: formData.item_quantity,
          item_current_quantity: formData.item_current_quantity,
          item_price: formData.item_price,
          item_unit: formData.item_unit,
        };

        axiosClient.post('/inventory', payload)
          .then((res) => {
            Swal.fire('Saved!', 'Item has been added.', 'success');
            onSave(res.data.package);
            onClose();
          })
          .catch((err) => {
            console.error('Error:', err.response?.data || err.message);
            Swal.fire('Error', 'There was a problem saving the item.', 'error');
          });
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <h2>Add Item</h2>
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

export default AddItemModal;
