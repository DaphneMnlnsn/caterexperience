import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import './DashboardCalendar.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DashboardCalendar() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/api/calendar/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error('Failed to fetch calendar events:', err));
  }, []);

  return (
    <div className="calendar-container">
      <h2>Upcoming Events</h2>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={events}
        headerToolbar={{
          left: '',
          center: 'title',
          right: '',
        }}
        dayMaxEventRows={2}
        eventContent={(arg) => (
          <div className="event-badge">
            {arg.event.title}
          </div>
        )}
        eventClick={(info) => {
          const bookingId = info.event.extendedProps.booking_id;
          if (bookingId) {
            navigate(`/admin/bookings/${bookingId}`);
          }
        }}
      />
    </div>
  );
}
