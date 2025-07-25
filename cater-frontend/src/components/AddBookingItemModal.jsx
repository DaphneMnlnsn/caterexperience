import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function AddBookingItemModal({ show, onClose, onSave, bookingId }) {
  const [formData, setFormData] = useState({
    item_id: '',
    quantity_assigned: '',
    remarks: '',
  });

  const [inventoryOptions, setInventoryOptions] = useState([]);

  useEffect(() => {
    axiosClient.get('/inventory')
      .then(res => setInventoryOptions(res.data))
      .catch(err => console.error('Failed to load inventory:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.item_id || !formData.quantity_assigned) {
      Swal.fire('Incomplete', 'Please select an item and specify the quantity.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Add Item?',
      text: 'This item will be assigned to the booking.',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, add it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          booking_id: bookingId,
          item_id: formData.item_id,
          quantity_assigned: formData.quantity_assigned,
          remarks: formData.remarks,
        };

        axiosClient.post(`/bookings/${bookingId}/inventory`, payload)
          .then(res => {
            Swal.fire('Added!', 'Item assigned to booking.', 'success');
            onSave();
            onClose();
          })
          .catch(err => {
            console.error(err.response?.data || err.message);
            Swal.fire('Error', 'Could not add item to booking.', 'error');
          });
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <h2>Add Inventory Item</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="add-form">
          <label>Inventory Item</label>
          <select name="item_id" value={formData.item_id} onChange={handleChange}>
            <option value="">Select item</option>
            {inventoryOptions.map(item => (
              <option key={item.item_id} value={item.item_id}>
                {item.item_name} ({item.item_type}) - {item.item_current_quantity} available
              </option>
            ))}
          </select>

          <label>Quantity Needed</label>
          <input
            type="number"
            name="quantity_assigned"
            value={formData.quantity_assigned}
            onChange={handleChange}
            min="1"
          />

          <label>Remarks (optional)</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
          />

          <div className="modal-buttons">
            <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="user-save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBookingItemModal;