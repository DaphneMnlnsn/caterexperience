import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminBookings.css';
import Sidebar from '../../components/Sidebar';
import BookingCalendar from '../../components/BookingCalendar';
import { FaBell } from 'react-icons/fa';

function AdminBookings() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = allEvents.filter(event =>
      event.title.toLowerCase().includes(term) ||
      event.client.toLowerCase().includes(term) ||
      event.date.includes(term)
    );

    setSearchResults(results);
  };


  const allEvents = [
    {
      title: "Kate’s Debut",
      client: "Kate Liang",
      date: "2025-07-13",
      time: "4:00am - 8:00pm",
      venue: "Pavilion",
      status: "Done"
    },
    {
      title: "Grace & Kurt’s 50th",
      client: "Grace Judith Papruz",
      date: "2025-07-20",
      time: "4:00am - 8:00pm",
      venue: "Pavilion",
      status: "Done"
    },
    {
      title: "Lance’s 50th Birthday",
      client: "Lance Cedric Bulan",
      date: "2025-07-20",
      time: "11:00am - 3:00pm",
      venue: "Pavilion",
      status: "Pending"
    },
  ];

  const selectedBookings = selectedDate
    ? allEvents.filter(e => e.date === selectedDate)
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
                      setSelectedDate(result.date);
                      setSearchResults([]);
                      setSearchTerm('');
                    }}>
                      <strong>{result.title}</strong> - {result.client} ({result.date})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <BookingCalendar
              allEvents={allEvents}
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
                      <strong>{b.title}</strong><br />
                      Client: {b.client}<br />
                      Time: {b.time}<br />
                      Venue: {b.venue}<br />
                      Status: <span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span>
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
