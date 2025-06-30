import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import './DashboardCalendar.css';

export default function DashboardCalendar() {
  return (
    <div className="calendar-container">
      <h2>Upcoming Events</h2>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={[
          { title: 'Wedding Booking', date: '2025-06-23' },
          { title: 'Corporate Catering', date: '2025-06-27' },
        ]}
        headerToolbar={{
          left: '',
          center: 'title',
          right: '',
        }}
        dayMaxEventRows={2}
      />
    </div>
  );
}
