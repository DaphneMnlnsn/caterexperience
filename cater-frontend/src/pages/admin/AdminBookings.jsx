import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminBookings.css';
import Sidebar from '../../components/Sidebar';
import BookingCalendar from '../../components/BookingCalendar';
import { FaBell } from 'react-icons/fa';
import axiosClient from '../../axiosClient';
import Header from '../../components/Header';

function AdminBookings() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;
  const navigate = useNavigate();
  const [bookingData, setBookingData] = React.useState([]);  
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVenue, setFilterVenue] = useState('all');

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

  const filteredEvents = bookingData.filter(e => {
    const matchesStatus =
      filterStatus === 'all' || e.booking_status === filterStatus;
    const matchesVenue =
      filterVenue === 'all' || e.event_location === filterVenue;
    const matchesSearch =
      !searchTerm ||
      e.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${e.customer?.customer_firstname || ''} ${
        e.customer?.customer_lastname || ''
      }`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesVenue && matchesSearch;
  });

  const selectedBookings = selectedDate
    ? bookingData.filter(e => {
        const matchesDate = e.event_date === selectedDate;
        const matchesStatus = filterStatus === 'all' || e.booking_status === filterStatus;
        const matchesVenue = filterVenue === 'all' || e.event_location === filterVenue;
        return matchesDate && matchesStatus && matchesVenue;
      })
    : [];

  const activeBookingsCount = selectedBookings.filter(
    e => e.booking_status !== 'Cancelled'
  ).length;

  return (
    <div className="page-container">
      <Sidebar />

      <div className="main-content">
        <Header user={user} />

        <section className="bookings-bottom">
          <div className="calendar-section">
            <div className="filter-bar">
              <div className="filters-container">
                <select className='filter-input' value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Finished">Finished</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <select className='filter-input' value={filterVenue} onChange={(e) => setFilterVenue(e.target.value)}>
                  <option value="all">All Venues</option>
                  {[...new Set(bookingData.map(b => b.event_location))].map((venue, idx) => (
                    <option key={idx} value={venue}>{venue}</option>
                  ))}
                </select>
              </div>

              <hr/>

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
            </div>


            <BookingCalendar
              allEvents={filteredEvents}
              selectedDate={selectedDate}
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

              {activeBookingsCount >= 3 ? (
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
