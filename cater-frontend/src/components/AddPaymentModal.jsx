import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function AddPaymentModal({ show, onClose, onSave, bookingId }) {
  
    const [formData, setFormData] = useState({
        amount_paid: '',
        payment_method: '',
        cash_given: '',
        change_given: '',
        remarks: '',
        proof_image: null,
        imagePreview: '',
        payment_date: new Date().toISOString().slice(0, 10),
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'proof_image') {
            const file = files[0];
            if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({
                ...prev,
                proof_image: file,
                imagePreview: reader.result,
                }));
            };
            reader.readAsDataURL(file);
            }
        } else {
            let updatedForm = {
            ...formData,
            [name]: value,
            };

            if (name === 'cash_given' || name === 'amount_paid') {
            const cash = parseFloat(
                name === 'cash_given' ? value : formData.cash_given
            );
            const amount = parseFloat(
                name === 'amount_paid' ? value : formData.amount_paid
            );

            if (!isNaN(cash) && !isNaN(amount)) {
                updatedForm.change_given = (cash - amount).toFixed(2);
            } else {
                updatedForm.change_given = '';
            }
            }

            setFormData(updatedForm);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.amount_paid || !formData.payment_method || !bookingId) {
            Swal.fire('Incomplete', 'Please fill in all required fields.', 'warning');
            return;
        }

        const payload = new FormData();
        payload.append('booking_id', bookingId);
        payload.append('amount_paid', formData.amount_paid);
        payload.append('payment_method', formData.payment_method);
        payload.append('payment_date', formData.payment_date);
        payload.append('remarks', formData.remarks);
        payload.append('cash_given', formData.cash_given || 0);
        payload.append('change_given', formData.change_given || 0);
        payload.append('payment_status', 'completed');

        if (formData.proof_image) {
            payload.append('proof_image', formData.proof_image);
        }

        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to save this payment?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
        }).then((result) => {
            if (result.isConfirmed) {
            axiosClient.post('/payments', payload, {
                headers: {
                'Content-Type': 'multipart/form-data',
                },
            })
            .then((res) => {
                Swal.fire('Saved!', 'Payment has been recorded.', 'success');
                onSave(res.data.payment);
                onClose();
            })
            .catch((err) => {
                console.error(err);
                Swal.fire('Error', 'Failed to record payment.', 'error');
            });
            }
        });
    };
    
    if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <h2>Add Payment Record</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="add-form">
          <label>Amount Paid</label>
          <input
            type="number"
            name="amount_paid"
            value={formData.amount_paid}
            onChange={handleChange}
          />

          <label>Payment Method</label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
          >
            <option value="">Select Method</option>
            <option value='Cash'>Cash</option>
            <option value="GCash">GCash</option>
          </select>

            <div className="name-row">
                <div className="half">
                    <label>Cash</label>
                    <input
                        type="number"
                        name="cash_given"
                        value={formData.cash_given}
                        onChange={handleChange}
                    />
                </div>
                <div className="half">
                    <label>Change</label>
                    <input
                        type="number"
                        name="change_given"
                        value={formData.change_given}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <label>Remarks</label>
            <input
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
            />

          <label>Proof of Payment (optional)</label>
          <div className="image-upload-container">
            <input
                type="file"
                name="proof_image"
                id="image-upload"
                accept="image/*"
                onChange={handleChange}
                hidden
            />
            <label htmlFor="image-upload" className="food-import-btn">Import Picture</label>
            {formData.imagePreview && (
              <img
                src={formData.imagePreview}
                alt="Preview"
                style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '0.5rem' }}
              />
            )}
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

export default AddPaymentModal;