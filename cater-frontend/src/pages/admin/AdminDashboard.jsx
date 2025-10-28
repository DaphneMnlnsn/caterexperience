import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import Sidebar from '../../components/Sidebar';
import DashboardCalendar from '../../components/DashboardCalendar';
import axiosClient from '../../axiosClient';
import Header from '../../components/Header';

function AdminDashboard() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;

  const [stats, setStats] = useState({
    total_events: 0,
    pending_bookings: 0,
    pending_payments: 0,
    staff_tasks: 0,
  });

  const [todayEvents, setTodayEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    axiosClient.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error fetching stats', err));

    axiosClient.get('/dashboard/today-events')
      .then(res => setTodayEvents(res.data))
      .catch(err => console.error('Error fetching today events', err));
  }, []);

  const groupTasksByStaff = (tasks = []) => {
    const grouped = {};
    tasks.forEach(task => {
      const staffName = task.assigned_to || 'Unassigned';
      if (!grouped[staffName]) grouped[staffName] = [];
      grouped[staffName].push(task);
    });
    return grouped;
  };

  const groupedTasks = selectedEvent ? groupTasksByStaff(selectedEvent.tasks) : {};

  return (
    <div className="page-container">
      <Sidebar />

      <div className="main-content">
        <Header user={user} />

        <section className="welcome-section">
          <h3>Welcome, {user ? user.first_name : 'User'}!</h3>
          <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="stats">
            <div className="stat-box">Events This Week <span>{stats.total_events}</span></div>
            <div className="stat-box">Pending Booking <span>{stats.pending_bookings}</span></div>
            <div className="stat-box">Pending Payments <span>{stats.pending_payments}</span></div>
            <div className="stat-box">Staff To-Do Tasks <span>{stats.staff_tasks}</span></div>
          </div>
        </section>

        <div className="todays-events">
          <h3>Today's Events</h3>
          {todayEvents.length > 0 ? (
            <div className="events-grid">
              {todayEvents.map(event => (
                <div
                  key={event.id}
                  className={`event-card ${selectedEvent?.id === event.id ? 'selected' : ''}`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <h5>{event.event_name}</h5>
                  <p>{event.start_time} - {event.end_time}</p>
                  <p>{event.venue_name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-list">No events today.</p>
          )}
        </div>

        <section className="page-bottom">
          <div className="calendar-section">
            <div className="calendar-container">
              <DashboardCalendar />
            </div>
          </div>

          <aside className="audit-log">
            <h3>Tasks</h3>
            {selectedEvent ? (
              selectedEvent.tasks && selectedEvent.tasks.length > 0 ? (
                Object.keys(groupedTasks).map((staff, index) => (
                  <div key={index} className="staff-group">
                    <h4>{staff}</h4>
                    <ul>
                      {groupedTasks[staff].map((task, i) => (
                        <li key={i} className="task-item">
                          <span className="task-title">{task.title}</span>
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
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="empty-list">No tasks for this event.</p>
              )
            ) : (
              <p className="empty-list">Select an event to view its tasks.</p>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;