import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function AddExtraChargeModal({ show, onClose, onSave, bookingId }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      Swal.fire('Incomplete', 'Please fill in all fields.', 'warning');
      return;
    }

    if (Number(formData.amount) <= 0) {
      Swal.fire('Invalid', 'Amount must be greater than 0.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this extra charge? This cannot be undone.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient
          .post('/extra-charges', {
            booking_id: bookingId,
            description: formData.description,
            amount: formData.amount,
          })
          .then((res) => {
            Swal.fire('Saved!', 'Extra charge has been recorded.', 'success');
            onSave(res.data);
            onClose();
          })
          .catch((err) => {
            console.error(err);
            Swal.fire('Error', 'Failed to record extra charge.', 'error');
          });
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <h2>Add Extra Charge</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="add-form">
          <label>Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <label>Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
          />

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

export default AddExtraChargeModal;
