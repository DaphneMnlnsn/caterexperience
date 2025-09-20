import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/AdminDashboard.css';
import Sidebar from '../../components/Sidebar';
import axiosClient from '../../axiosClient';
import Header from '../../components/Header';

function ClientDashboard() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    days_left: 0,
    remaining_balance: 0,
    contact: '',
  });

  useEffect(() => {
    axiosClient.get('/dashboard/client/stats')
      .then(res => {
        setEvent(res.data.event);
        setPayments(res.data.payments);
        setStats({
          days_left: res.data.days_left,
          remaining_balance: res.data.remaining_balance,
          contact: res.data.contact,
        });
      })
      .catch(err => console.error('Error fetching client dashboard', err));
  }, []);

  return (
    <div className="page-container">
      <Sidebar />

      <div className="main-content">
        <Header user={user} />

        <section className="welcome-section">
          <h3>Welcome, {user ? user.first_name : 'User'}!</h3>
          <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="stats">
            <div className="stat-box">
              Days Left before Event <span>{stats.days_left}</span>
            </div>
            <div className="stat-box">
              Remaining Balance to Pay <span>{stats.remaining_balance.toFixed(2)}</span>
            </div>
            <div className="stat-box">
              Contact/Bantay <span>{stats.contact ? stats.contact : 'N/A'}</span>
            </div>
          </div>
        </section>


        <section className="page-bottom">
          <section className="event-section">
            <h3>Your Upcoming Event</h3>
            {event ? (
              <div className="event-card">
                <h4>{event.title}</h4>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Date and Time:</strong> {event.datetime}</p>
                <p><strong>Package:</strong> {event.package}</p>
                <p><strong>Theme:</strong> {event.theme}</p>
                <p><strong>Additional Notes:</strong> {event.notes ? event.notes : 'N/A'}</p>
                <button className="btn-details" onClick={() => navigate(`/bookings/${event.bookingId}`)}>View More Details</button>
              </div>
            ) : (
              <p>No upcoming events.</p>
            )}
          </section>

          <aside className="audit-log">
            <h3>Payments Made</h3>
            <ul>
              {payments.length > 0 ? (
                payments.map((p, index) => (
                  <li key={index}>
                    <p>{p.date} <br /> You paid Php {p.amount} via {p.method}</p>
                    <hr />
                  </li>
                ))
              ) : (
                <li>No payments recorded</li>
              )}
            </ul>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default ClientDashboard;