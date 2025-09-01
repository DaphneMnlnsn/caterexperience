import React, { useEffect, useState } from 'react';
import './VenuePreview.css';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';

function VenuePreview({ bookingId, isWaiter, isClient }) {
  const navigate = useNavigate();
  const [objects, setObjects] = useState(null);

  useEffect(() => {
    if (!bookingId) return;

    axiosClient.get(`/setups/${bookingId}`)
      .then(res => {
        if (res.data) {
          try {
            const parsed = JSON.parse(res.data.objects);
            setObjects(parsed);
          } catch (e) {
            console.error('Invalid layout JSON:', e);
          }
        }
      })
      .catch(err => console.error('Failed to load venue setup:', err));
  }, [bookingId]);

  return (
    <div className="venue-preview">
      {objects ? (
        <div className="preview-placeholder">
          <span>[2D Layout Loaded]</span>
        </div>
      ) : (
        <div className="preview-placeholder">[Preview here]</div>
      )}
      {isWaiter || isClient ? (
        <button
          className="booking-edit-btn"
          onClick={() => navigate(`/view/${bookingId}`)}
        >
          View 2D Design
        </button>
      ) : (
        <button
          className="booking-edit-btn"
          onClick={() => navigate(`/edit/${bookingId}`)}
        >
          Edit 2D Design
        </button>
      )}
    </div>
  );
}

export default VenuePreview;
