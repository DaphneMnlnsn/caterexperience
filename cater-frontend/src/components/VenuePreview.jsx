import React from 'react';
import './VenuePreview.css';

function VenuePreview({ imagePath }) {
  return (
    <div className="venue-preview">
      {imagePath ? (
        <img
          src={`http://localhost:8000/storage/${imagePath}`}
          alt="Venue Design"
          className="venue-image"
        />
      ) : (
        <div className="preview-placeholder">[Preview here]</div>
      )}
      <button className="booking-edit-btn">Edit 2D Design</button>
    </div>
  );
}

export default VenuePreview;
