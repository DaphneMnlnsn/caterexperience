import React, { useEffect, useState } from "react";
import "./VenuePreview.css";
import { useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";

import { Stage, Layer } from "react-konva";
import pavilionImg from "../assets/Pavilion.svg";
import poolsideImg from "../assets/Poolside.svg";
import airconImg from "../assets/Aircon.svg";
import OutsideVenueLayout from "./OutsideVenueLayout";

function VenuePreview({ bookingId, isWaiter, isClient, canEdit }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [venueType, setVenueType] = useState(null);

  const venueImages = {
    Pavilion: pavilionImg,
    Poolside: poolsideImg,
    "Airconditioned Room": airconImg,
  };

  useEffect(() => {
    if (!bookingId) return;

    axiosClient
      .get(`/setups/${bookingId}`)
      .then((res) => {
        if (res.data) {
          setStatus(res.data.setup?.status || res.data.status);
          setVenueType(res.data.setup?.layout_type || res.data.layout_type);
        }
      })
      .catch((err) => console.error("Failed to load venue setup:", err));
  }, [bookingId]);

  const isVisible = status === "submitted" || status === "approved";
  const venueImage = venueType ? venueImages[venueType] : null;

  return (
    <div className="venue-preview">
      <div className="venue-thumbnail-wrapper">
        {venueType === "Custom Venue" ? (
          <div className="custom-venue-preview">
            <Stage width={800} height={400}>
              <Layer>
                <OutsideVenueLayout />
              </Layer>
            </Stage>
          </div>
        ) : venueImage ? (
          <img
            src={venueImage}
            alt={venueType}
            className="venue-thumbnail"
          />
        ) : (
          <div className="preview-placeholder">[Preview here]</div>
        )}

        <div className="venue-thumbnail-overlay">
          {isVisible ? (
            <button
              className="booking-edit-btn"
              onClick={() => navigate(`/view/${bookingId}/${canEdit}`)}
            >
              View 2D Design
            </button>
          ) : (
            !(isWaiter || isClient) && (
              <button
                className="booking-edit-btn venue-btn"
                onClick={() => navigate(`/edit/${bookingId}/true`)}
              >
                Edit 2D Design
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default VenuePreview;
