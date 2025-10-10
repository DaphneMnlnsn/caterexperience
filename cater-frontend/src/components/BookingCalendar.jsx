import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './BookingCalendar.css';

export default function BookingCalendar({ onDateClick, allEvents, selectedDate }) {
  return (
    <div className="booking-calendar-container">
      <h2 className="booking-calendar-title">Event Calendar</h2>
      <FullCalendar
        key={allEvents.length + selectedDate}
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
          const cell = arg.el;
          const count = allEvents.filter(ev => ev.event_date === dateStr).length;

          if (count > 0) {
            const badge = document.createElement('div');
            badge.className = 'day-event-count-badge';
            badge.textContent = count;
            arg.el.querySelector('.fc-daygrid-day-frame').appendChild(badge);
          }

          if (selectedDate === dateStr) {
            cell.classList.add('selected-date');
          } else {
            cell.classList.remove('selected-date');
          }
        }}

      />
    </div>
  );
}
