import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function AddPaymentModal({ show, onClose, onSave, bookingId, remainingBalance }) {
  
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

    const handleRemoveImage = () => {
      setFormData((prev) => ({
        ...prev,
        proof_image: null,
        imagePreview: ''
      }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.amount_paid || !formData.payment_method || !bookingId) {
          Swal.fire('Incomplete', 'Please fill in all required fields.', 'warning');
          return;
        }

        if (Number(formData.amount_paid) <= 0) {
          Swal.fire('Invalid', 'Amount paid must be greater than 0.', 'warning');
          return;
        }

        if (Number(formData.amount_paid) > remainingBalance) {
          Swal.fire('Invalid', 'Amount paid must not be greater than remaining balance.', 'warning');
          return;
        }

        if (formData.payment_method === 'Cash') {
          if (!formData.cash_given || Number(formData.cash_given) <= 0) {
            Swal.fire('Invalid', 'Cash given must be greater than 0.', 'warning');
            return;
          }

          if (Number(formData.cash_given) < Number(formData.amount_paid)) {
            Swal.fire(
              'Invalid',
              'Cash given cannot be less than the amount paid.',
              'warning'
            );
            return;
          }

          if (Number(formData.change_given) < 0) {
            Swal.fire('Invalid', 'Change cannot be negative.', 'warning');
            return;
          }
        }

        if (formData.payment_method === 'GCash' && !formData.proof_image) {
          Swal.fire('Incomplete', 'Please upload a proof of payment for GCash.', 'warning');
          return;
        }

        if(formData.proof_image){
          const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
          if (!validTypes.includes(formData.proof_image.type)) {
            Swal.fire('Invalid', 'Image must be JPG, PNG, or WEBP.', 'warning');
            return;
          }
      
          const maxSize = 2 * 1024 * 1024; 
          if (formData.proof_image.size > maxSize) {
            Swal.fire('Invalid', 'Image must be less than 2MB.', 'warning');
            return;
          }
        }
        
        const payload = new FormData();
        payload.append('booking_id', bookingId);
        payload.append('amount_paid', formData.amount_paid);
        payload.append('payment_method', formData.payment_method);
        payload.append('payment_date', formData.payment_date);
        payload.append('remarks', formData.remarks);
        payload.append('cash_given', formData.cash_given || 0);
        payload.append('change_given', formData.change_given || 0);
        payload.append('payment_status', 'Completed');

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
            <select
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
            >
                <option value="">Select a remark</option>
                <option value="80% Downpayment">80% Downpayment</option>
                <option value="Remaining Balance">Remaining Balance</option>
                <option value="Payment for Extra Charge">Payment for Extra Charge</option>
                <option value="Other Payment">Other Payment</option>
            </select>

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
              <>
              <img
                src={formData.imagePreview}
                alt="Preview"
                style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '0.5rem' }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '1px',
                  background: '#ff4d4d',
                  border: 'none',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
              </>
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