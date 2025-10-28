import React, { useEffect, useState } from 'react';
import '../admin/AdminDashboard.css';
import Sidebar from '../../components/Sidebar';
import DashboardCalendar from '../../components/DashboardCalendar';
import axiosClient from '../../axiosClient';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

function StylistDashboard() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_events: 0,
    setup_plans_due: 0,
    setup_plans_submitted: 0,
    todo_tasks: 0,
  });

  const [deadlines, setDeadlines] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);

  useEffect(() => {
    axiosClient.get('/dashboard/stylist/stats')
      .then(res => {
        setStats(res.data);
        setDeadlines(res.data.deadlines || []);
      })
      .catch(err => console.error('Error fetching stats', err));

    axiosClient.get('/dashboard/staff/today-events')
      .then(res => setTodayEvents(res.data))
      .catch(err => console.error('Error fetching today events', err));
  }, []);

  return (
    <div className="page-container">
      <Sidebar />

      <div className="main-content">
        <Header user={user} />

        <section className="welcome-section">
          <h3>Welcome, {user ? user.first_name : 'User'}!</h3>
          <p>{new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}</p>

          <div className="stats">
            <div className="stat-box">Events This Week <span>{stats.total_events}</span></div>
            <div className="stat-box">Setup Plans Due <span>{stats.setup_plans_due}</span></div>
            <div className="stat-box">Setup Plans Submitted <span>{stats.setup_plans_submitted}</span></div>
            <div className="stat-box">To-Do Tasks <span>{stats.todo_tasks}</span></div>
          </div>
        </section>

        <section className="todays-events">
          <h3>Today's Events</h3>
          <div className="events-grid">
            {todayEvents.length > 0 ? (
              todayEvents.map((event, index) => (
                <div className="event-card" key={index} onClick={() => navigate(`/bookings/${event.event_code}`)}>
                  <h5>{event.event_name}</h5>
                  <p><strong>Venue:</strong> {event.venue_name}</p>
                  <p><strong>Time:</strong> {event.start_time} - {event.end_time}</p>

                  {event.tasks && event.tasks.length > 0 ? (
                    event.tasks.map((task, i) => (
                      <div key={i} className="task-item">
                        <span className={`status-tag ${
                          task.status === 'Done'
                            ? 'done'
                            : task.status === 'In-Progress'
                            ? 'in-progress'
                            : 'to-do'
                        }`}>
                          {task.status}
                        </span>
                        <span className="task-title">
                          {task.title}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="empty-list">No tasks assigned.</p>
                  )}
                </div>
              ))
            ) : (
              <p className="empty-list">No events scheduled for today.</p>
            )}
          </div>
        </section>

        <section className="page-bottom">
          <div className="calendar-section">
            <DashboardCalendar />
          </div>

          <aside className="audit-log">
            <h3>Setup Deadlines</h3>
            <ul>
              {deadlines.length > 0 ? (
                deadlines.map((deadline, index) => (
                  <li key={index}>
                    <strong>{deadline.layout_name}</strong>
                    <span>
                      {' '}– due{' '}
                      {new Date(deadline.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </li>
                ))
              ) : (
                <li>No upcoming deadlines</li>
              )}
            </ul>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default StylistDashboard;