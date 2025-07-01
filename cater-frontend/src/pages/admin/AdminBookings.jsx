import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminBookings.css';
import Sidebar from '../../components/Sidebar';
import BookingCalendar from '../../components/BookingCalendar';
import { FaBell } from 'react-icons/fa';

function AdminBookings() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [bookingData, setBookingData] = React.useState([]);
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/bookings')
    .then(res => res.json())
    .then(data => {
      setBookingData(data.bookings);
    })
    .catch(err => console.error('Failed to fetch bookings:', err));
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

    const results = bookingData.filter(event =>
      event.event_name.toLowerCase().includes(term) ||
      event.customer_name.toLowerCase().includes(term) ||
      event.event_date.includes(term)
    );

    setSearchResults(results);
  };

  const selectedBookings = selectedDate
    ? bookingData.filter(e => e.event_date === selectedDate)
    : [];

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left"></div>
          <div className="topbar-right">
            <span className="user-name">
              {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
            </span>
            <FaBell className="notif-icon" />
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

              <button className="add-event-btn">+ Add Event</button>

              {selectedBookings.length > 0 ? (
                <ul>
                  {selectedBookings.map((b, index) => (
                    <li
                      key={index}
                      className="clickable-event"
                      onClick={() => navigate(`/admin/events/${b.id}`)}>
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
