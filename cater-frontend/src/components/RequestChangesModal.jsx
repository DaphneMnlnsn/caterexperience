import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axiosClient from '../axiosClient';
import './RequestChangesModal.css';

function RequestChangesModal({ show, onClose, bookingId, onSave }) {
  const [requestText, setRequestText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!requestText.trim()) {
      Swal.fire('Empty Request', 'Please enter your request before submitting.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Submit Request?',
      text: 'Your change request will be sent to the caterer.',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, submit',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          booking_id: bookingId,
          request: requestText,
        };

        axiosClient.post(`/bookings/${bookingId}/requests`, payload)
          .then(() => {
            Swal.fire('Submitted!', 'Your change request has been sent.', 'success');
            if (onSave) onSave();
            onClose();
          })
          .catch((err) => {
            console.error(err.response?.data || err.message);
            Swal.fire('Error', 'Could not submit your request.', 'error');
          });
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal request-changes-modal">
        <div className="modal-header">
          <h2>Request Changes</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="request-form">
          <textarea
            name="request"
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            placeholder="Type your requested changes here..."
          />

          <div className="modal-buttons">
            <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="user-save-btn">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestChangesModal;
