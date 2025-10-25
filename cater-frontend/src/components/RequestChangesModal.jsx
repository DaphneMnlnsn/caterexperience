import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axiosClient from '../axiosClient';
import './RequestChangesModal.css';

function RequestChangesModal({ show, onClose, bookingId, onSave, isClient, isAdmin, seeRequests }) {
  const [requestText, setRequestText] = useState('');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (show && bookingId) {
      fetchRequests();
    }
  }, [isClient, show, bookingId]);

  const fetchRequests = () => {
    axiosClient.get(`/bookings/${bookingId}/requests`)
      .then(res => setRequests(res.data))
      .catch(err => console.error('Failed to load requests:', err));
  };

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

  const handleStatusChange = (id, status) => {
    Swal.fire({
      title: `Mark as ${status}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${status}`,
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.put(`/requests/${id}/status`, { status })
          .then(() => {
            Swal.fire('Updated!', `Request marked as ${status}.`, 'success');
            fetchRequests();
            if (onSave) onSave();
          })
          .catch((err) => {
            console.error(err.response?.data || err.message);
            Swal.fire('Error', 'Could not update status.', 'error');
          });
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal request-changes-modal">
        <div className="modal-header">
          {isClient && !seeRequests ? (
            <h2>Request Changes</h2>
          ) : (
            <h2>Requested Changes</h2>
          )}
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {isClient && !seeRequests ? (
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
        ) : (
          <div className="request-list">
            {requests.length > 0 ? (
              <ul>
                {requests.map((r) => (
                  <li key={r.id} className="request-item">
                    <p>
                      <strong>{r.customer?.first_name} {r.customer?.last_name}</strong>
                    </p>
                    <p>{r.request_text}</p>
                    <p>
                      Status: <span className={`status ${r.status}`}>{r.status}</span>
                    </p>
                    {r.status === 'pending' && !isClient && (
                      <div className="request-action-buttons">
                        <button
                          className="approve-btn"
                          onClick={() => handleStatusChange(r.id, 'approved')}
                        >
                          ✔
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleStatusChange(r.id, 'rejected')}
                        >
                          ✖
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No requests found for this booking.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestChangesModal;