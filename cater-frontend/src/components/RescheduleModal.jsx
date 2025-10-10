import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axiosClient from '../axiosClient';
import './RescheduleModal.css';

function RescheduleModal({ show, onClose, bookingId, onSave, isAdmin }) {
  const [formData, setFormData] = useState({
    event_date: '',
    event_start_time: '',
    event_end_time: '',
  });
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() + 8); 
  const minDateStr = minDate.toISOString().split('T')[0];

  useEffect(() => {
    if (!show) {
      setFormData({ event_date: '', event_start_time: '', event_end_time: '' });
      setAvailabilityError('');
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === 'event_start_time' && value) {
      const [hours, minutes] = value.split(':').map(Number);
      const startDate = new Date(2000, 0, 1, hours, minutes);
      startDate.setHours(startDate.getHours() + 4);
      const endHours = String(startDate.getHours()).padStart(2, '0');
      const endMinutes = String(startDate.getMinutes()).padStart(2, '0');
      updated.event_end_time = `${endHours}:${endMinutes}`;
    }

    setFormData(updated);
  };

  const handleConfirm = async () => {
    if (!isAdmin) return;

    const { event_date, event_start_time, event_end_time } = formData;

    if (!event_date || !event_start_time || !event_end_time) {
      setAvailabilityError('All fields are required');
      return;
    }

    setCheckingAvailability(true);
    setAvailabilityError('');

    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to reschedule this event?',
        icon: 'question',
        showCancelButton: true,
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Yes, reschedule!',
      });

      if (result.isConfirmed) {
        await axiosClient.post(`/bookings/${bookingId}/resched`, {
          event_date,
          event_start_time,
          event_end_time,
        });

        Swal.fire('Rescheduled!', 'Event was successfully moved.', 'success');
        if (onSave) onSave();
        onClose();
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setAvailabilityError('Availability check failed.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal reschedule-modal">
        <div className="modal-header">
          <h2>Reschedule Event</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="reschedule-form">
          <label>Event Date</label>
          <input
            type="date"
            name="event_date"
            value={formData.event_date}
            onChange={handleChange}
            min={minDateStr}
          />

          <label>Start Time</label>
          <input
            type="time"
            name="event_start_time"
            value={formData.event_start_time}
            onChange={handleChange}
          />

          <label>End Time</label>
          <input
            type="time"
            name="event_end_time"
            value={formData.event_end_time}
            onChange={handleChange}
          />

          {availabilityError && <p className="error">{availabilityError}</p>}

          <div className="modal-buttons">
            <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>
            <button
              type="button"
              className="user-save-btn"
              onClick={handleConfirm}
              disabled={checkingAvailability}
            >
              {checkingAvailability ? 'Checking...' : 'Confirm Reschedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RescheduleModal;
