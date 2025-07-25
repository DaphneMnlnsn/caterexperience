import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function EditBookingItemModal({ show, onClose, onSave, bookingItem }) {
  const [formData, setFormData] = useState({
    id: '',
    item_id: '',
    quantity_needed: '',
    remarks: '',
  });

  const [inventoryOptions, setInventoryOptions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (bookingItem) {
      setFormData({
        id: bookingItem.booking_inventory_id,
        item_id: bookingItem.item_id || '',
        quantity_needed: bookingItem.quantity_needed || '',
        remarks: bookingItem.remarks || '',
      });
    }
  }, [bookingItem]);

  useEffect(() => {
    axiosClient.get('/inventory')
      .then(res => setInventoryOptions(res.data))
      .catch(err => console.error('Failed to load inventory:', err));
  }, []);

  useEffect(() => {
    const item = inventoryOptions.find(inv => inv.item_id === parseInt(formData.item_id));
    setSelectedItem(item);
  }, [formData.item_id, inventoryOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.item_id || !formData.quantity_needed) {
      Swal.fire('Incomplete', 'Please select an item and specify the quantity.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Update Item?',
      text: 'Changes will be saved for this booking.',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, update it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          item_id: formData.item_id,
          quantity_needed: formData.quantity_needed,
          remarks: formData.remarks,
        };

        axiosClient.put(`/bookings/inventory/${formData.id}`, payload)
          .then(res => {
            Swal.fire('Updated!', 'Booking item was updated.', 'success');
            onSave(res.data);
            onClose();
          })
          .catch(err => {
            console.error(err.response?.data || err.message);
            Swal.fire('Error', 'Could not update booking item.', 'error');
          });
      }
    });
  };

  if (!show || !bookingItem) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <h2>Edit Booking Item</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="add-form">
          <label>Inventory Item</label>
          <select name="item_id" value={formData.item_id} disabled>
            <option value="">Select item</option>
            {inventoryOptions.map(item => (
              <option key={item.id} value={item.id}>
                {item.item_name} ({item.item_type}) - {item.current_quantity} available
              </option>
            ))}
          </select>

          {selectedItem && (
            <p className="stock-note">
              <strong>Available:</strong> {selectedItem.current_quantity} {selectedItem.item_unit}
            </p>
          )}

          <label>Quantity Needed</label>
          <input
            type="number"
            name="quantity_needed"
            value={formData.quantity_needed}
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
            <button type="submit" className="user-save-btn">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBookingItemModal;