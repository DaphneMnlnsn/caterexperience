import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminBookings.css';
import Sidebar from '../../components/Sidebar';
import BookingCalendar from '../../components/BookingCalendar';
import { FaBell } from 'react-icons/fa';
import axiosClient from '../../axiosClient';
import NotificationsDropdown from '../../components/NotificationsDropdown';

function AdminBookings() {
  const storedUser = localStorage.getItem('user');
const user = storedUser ? JSON.parse(atob(storedUser)) : null;
  const navigate = useNavigate();
  const [bookingData, setBookingData] = React.useState([]);  
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const isWithinRestrictedRange = (() => {
    const today = new Date();
    const selected = new Date(selectedDate);
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    const oneWeekFromToday = new Date(today);
    oneWeekFromToday.setDate(today.getDate() + 7);
    return selected <= oneWeekFromToday;
  })();

  useEffect(() => {
    axiosClient.get('/bookings')
    .then(res => {
      setBookingData(res.data.bookings);
    })
    .catch(err => console.error('Failed to fetch bookings:', err.response?.data || err.message));
  }, []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = bookingData.filter(event => {
      const title = event.event_name || '';
      const titleMatch = title.toLowerCase().includes(term);

      const first = event.customer?.customer_firstname || '';
      const middle = event.customer?.customer_middlename || '';
      const last = event.customer?.customer_lastname || '';
      const fullName = `${first} ${middle} ${last}`.trim();
      const nameMatch = fullName.toLowerCase().includes(term);

      const date = event.event_date || '';
      const dateMatch = date.includes(term);

      return titleMatch || nameMatch || dateMatch;
    });

    setSearchResults(results);
  };

  const selectedBookings = selectedDate
    ? bookingData.filter(e => e.event_date === selectedDate)
    : [];

  return (
    <div className="page-container">
      <Sidebar />

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left"></div>
          <div className="topbar-right">
            <span className="user-name">
              {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
            </span>
            <NotificationsDropdown />
          </div>
        </header>

        <section className="bookings-bottom">
          <div className="calendar-section">
            <div className="search-box-bookings">
              <input
                type="text"
                placeholder="🔍 Search event by title, client, or date..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchResults.length > 0 && (
                <ul className="search-results">
                  {searchResults.map((result, index) => (
                    <li key={index} onClick={() => {
                      setSelectedDate(result.event_date);
                      setSearchResults([]);
                      setSearchTerm('');
                    }}>
                      <strong>{result.event_name}</strong> - {result.customer.customer_firstname} {result.customer.customer_middlename ? result.customer.customer_middlename + ' ' : ''}{result.customer.customer_lastname} ({result.event_date})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <BookingCalendar
              allEvents={bookingData}
              onDateClick={(dateStr) => {
                console.log("Clicked date:", dateStr);
                setSelectedDate(dateStr);
              }}
            />
          </div>

          {selectedDate && (
            <aside className="booking-sidebar">
              <div className="sidebar-header">
                <h4>Events on {new Date(selectedDate).toDateString()}</h4>
                <button className="close-btn" onClick={() => setSelectedDate(null)}>×</button>
              </div>

              {selectedBookings.length >= 3 ? (
                <div className="event-limit-warning">⚠ Cannot handle more events on this day</div>
              ) : !isWithinRestrictedRange ? (
                <button
                  className="add-event-btn"
                  onClick={() =>
                    navigate(`/admin/book`, { state: { eventDate: selectedDate } })
                  }>
                  + Add Event
                </button>
              ) : (
                <div className="event-limit-warning">⚠ Cannot add events to past, today, or close dates</div>
              )}

              {selectedBookings.length > 0 ? (
                <ul>
                  {selectedBookings.map((b, index) => (
                    <li
                      key={index}
                      className="clickable-event"
                      onClick={() => navigate(`/bookings/${b.booking_id}`)}>
                      <strong>{b.event_name}</strong><br />
                      Client: {b.customer.customer_firstname} {b.customer.customer_middlename ? b.customer.customer_middlename + ' ' : ''}{b.customer.customer_lastname}<br />
                      Time: {b.event_start_time} - {b.event_end_time}<br />
                      Venue: {b.event_location}<br />
                      Status: <span className={`status-badge ${b.booking_status.toLowerCase()}`}>{b.booking_status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No events found.</p>
              )}
            </aside>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminBookings;
