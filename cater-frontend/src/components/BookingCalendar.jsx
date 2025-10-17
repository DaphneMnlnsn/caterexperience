import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './BookingCalendar.css';

export default function BookingCalendar({ onDateClick, allEvents, selectedDate }) {
  const calendarRef = useRef(null);

  const updateDayBadges = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    document.querySelectorAll('.fc-daygrid-day').forEach(cell => {
      const dateStr = cell.getAttribute('data-date');
      const count = allEvents.filter(ev => ev.event_date === dateStr).length;

      const existing = cell.querySelector('.day-event-count-badge');
      if (existing) existing.remove();

      if (count > 0) {
        const badge = document.createElement('div');
        badge.className = 'day-event-count-badge';
        badge.textContent = count;
        cell.querySelector('.fc-daygrid-day-frame')?.appendChild(badge);
      }

      if (selectedDate === dateStr) {
        cell.classList.add('selected-date');
      } else {
        cell.classList.remove('selected-date');
      }
    });
  };

  useEffect(() => {
    updateDayBadges();
  }, [allEvents, selectedDate]);

  return (
    <div className="booking-calendar-container">
      <h2 className="booking-calendar-title">Event Calendar</h2>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={[]}
        dateClick={(info) => onDateClick(info.dateStr)}
        datesSet={() => {
          setTimeout(updateDayBadges, 0);
        }}
      />
    </div>
  );
}