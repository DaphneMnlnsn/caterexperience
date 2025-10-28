import React, { useEffect, useState } from 'react';
import '../admin/AdminDashboard.css';
import Sidebar from '../../components/Sidebar';
import DashboardCalendar from '../../components/DashboardCalendar';
import axiosClient from '../../axiosClient';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

function WaiterDashboard() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_events: 0,
    finished_events: 0,
    inventory_updates: [],
    call_time: "N/A",
    setup_checklist: [],
  });

  const [todayEvents, setTodayEvents] = useState([]);

  useEffect(() => {
    axiosClient.get('/dashboard/waiter/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error fetching waiter stats', err));

    axiosClient.get('/dashboard/staff/today-events')
      .then(res => setTodayEvents(res.data))
      .catch(err => console.error('Error fetching today events', err));
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    const d = new Date(timeStr);
    if (isNaN(d)) return "N/A";
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="page-container">
      <Sidebar />

      <div className="main-content">
        <Header user={user} />

        {/* Welcome Section */}
        <section className="welcome-section">
          <h3>Welcome, {user ? user.first_name : 'User'}!</h3>
          <p>{new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}</p>

          <div className="stats">
            <div className="stat-box">Events This Week <span>{stats.total_events}</span></div>
            <div className="stat-box">Inventory Items to Update <span>
              {stats.inventory_updates && typeof stats.inventory_updates === "object"
                ? Object.keys(stats.inventory_updates).length
                : 0}
            </span></div>
            <div className="stat-box">Call Time <span>{formatTime(stats.call_time)}</span></div>
          </div>
        </section>

        {/* Today's Events */}
        <section className="todays-events">
          <h3>Today's Events</h3>
          <div className="events-grid">
            {todayEvents.length > 0 ? (
              todayEvents.map((event, index) => (
                <div
                  className="event-card"
                  key={index}
                  onClick={() => navigate(`/bookings/${event.event_code}`)}
                >
                  <h5>{event.event_name}</h5>
                  <p><strong>Venue:</strong> {event.venue_name}</p>
                  <p><strong>Time:</strong> {event.start_time} - {event.end_time}</p>

                  {event.tasks && event.tasks.length > 0 ? (
                    event.tasks.map((task, i) => (
                      <div key={i} className="task-item">
                        <span
                          className={`status-tag ${
                            task.status === 'Done'
                              ? 'done'
                              : task.status === 'In-Progress'
                              ? 'in-progress'
                              : 'to-do'
                          }`}
                        >
                          {task.status}
                        </span>
                        <span className="task-title">{task.title}</span>
                      </div>
                    ))
                  ) : (
                    <p className="empty-list">No assigned tasks.</p>
                  )}
                </div>
              ))
            ) : (
              <p className="empty-list">No events scheduled for today.</p>
            )}
          </div>
        </section>

        {/* Bottom Section: Calendar + Setup Checklist */}
        <section className="page-bottom">
          <div className="calendar-section">
            <DashboardCalendar />
          </div>

          <aside className="audit-log">
            <h3>Setup Checklist</h3>
            <ul>
              {stats.setup_checklist && stats.setup_checklist.length > 0 ? (
                stats.setup_checklist.map((event, idx) => (
                  <li key={idx}>
                    <strong>{event.event_name}</strong><br />
                    Date: {new Date(event.event_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })} <br />
                    Venue: {event.event_location} <br />
                    Theme: {event.theme_name} <br />
                    Start: {
                      event.event_start
                        ? new Date(`1970-01-01T${event.event_start}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : 'N/A'
                    } <br />
                    Call Time: {formatTime(event.call_time)} <br />
                    <strong>To Set Up:</strong>
                    <ul className="setup-checklist">
                      {event.inventory && event.inventory.map((inv, invIdx) => (
                        <li key={invIdx}>- {inv.quantity_assigned} {inv.item_name}</li>
                      ))}
                      <li>- {event.waiters || 0} waiters</li>
                    </ul>
                  </li>
                ))
              ) : (
                <li>No assigned events today.</li>
              )}
            </ul>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default WaiterDashboard;