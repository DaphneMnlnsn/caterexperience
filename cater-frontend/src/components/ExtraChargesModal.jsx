import React, { useState, useEffect } from 'react';
import axiosClient from '../axiosClient';
import './RequestChangesModal.css';

function ExtraChargesModal({ show, onClose, bookingId }) {
  const [charges, setCharges] = useState([]);

  useEffect(() => {
    if (show && bookingId) {
      fetchCharges();
    }
  }, [show, bookingId]);

  const fetchCharges = () => {
    axiosClient.get(`/bookings/${bookingId}/extra-charges`)
      .then(res => setCharges(res.data))
      .catch(err => console.error('Failed to load extra charges:', err));
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal request-changes-modal">
        <div className="modal-header">
          <h2>Extra Charges</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="request-list">
          {charges.length > 0 ? (
            <ul>
              {charges.map((c) => (
                <li key={c.id} className="request-item">
                  <p><strong>{c.description}</strong></p>
                  <p>₱{parseFloat(c.amount).toLocaleString()}.00</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No extra charges found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExtraChargesModal;