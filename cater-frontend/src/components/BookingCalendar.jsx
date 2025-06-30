import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './BookingCalendar.css';

export default function BookingCalendar({ onDateClick, allEvents }) {
  return (
    <div className="booking-calendar-container">
      <h2 className="booking-calendar-title">Event Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={[]}
        dateClick={(info) => {
          const clickedDate = info.dateStr;
          onDateClick(clickedDate);
        }}
        dayCellDidMount={(arg) => {
          const dateStr = arg.date.toLocaleDateString('en-CA');
          const count = allEvents.filter(ev => ev.date === dateStr).length;

          if (count > 0) {
            const badge = document.createElement('div');
            badge.className = 'day-event-count-badge';
            badge.textContent = count;
            arg.el.querySelector('.fc-daygrid-day-frame').appendChild(badge);
          }
        }}

      />
    </div>
  );
}
