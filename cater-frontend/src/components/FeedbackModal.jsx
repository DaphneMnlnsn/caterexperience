import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axiosClient from '../axiosClient';
import './RequestChangesModal.css';

function FeedbackModal({ show, onClose, bookingId, onSave, isClient }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingFeedback, setExistingFeedback] = useState(null);

  useEffect(() => {
    if (show && bookingId) {
      fetchFeedback();
    }
  }, [show, bookingId]);

  const fetchFeedback = () => {
    axiosClient.get(`/feedback/booking/${bookingId}`)
      .then(res => {
        const data = res.data.data;
        setExistingFeedback(data);
        setRating(data.rating);
        setComment(data.comment || '');
      })
      .catch(() => {
        setExistingFeedback(null);
        setRating(0);
        setComment('');
      });
  };

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0) {
      Swal.fire('No Rating', 'Please select a rating before submitting.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Submit Feedback?',
      text: 'Your feedback will be sent to Ollinati Catering.',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, submit',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          booking_id: bookingId,
          rating,
          comment,
        };

        axiosClient.post(`/feedback`, payload)
          .then(() => {
            Swal.fire('Thank you!', 'Your feedback has been submitted.', 'success');
            if (onSave) onSave();
            onClose();
          })
          .catch((err) => {
            console.error(err.response?.data || err.message);
            Swal.fire('Error', 'Could not submit your feedback.', 'error');
          });
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal feedback-modal">
        <div className="modal-header">
          <h2>{isClient ? 'Rate Your Experience' : 'Client Feedback'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {isClient ? (
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= rating ? 'filled' : ''}`}
                  onClick={() => handleRatingClick(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about our service..."
            />

            <div className="modal-buttons">
              <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="user-save-btn">Submit</button>
            </div>
          </form>
        ) : (
          <div className="feedback-display">
            {existingFeedback ? (
              <>
                <div className="rating-stars readonly">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= existingFeedback.rating ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="feedback-comment">
                  {existingFeedback.comment || 'No additional comments provided.'}
                </p>
              </>
            ) : (
              <p>No feedback submitted for this booking.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedbackModal;