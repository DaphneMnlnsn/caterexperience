import React, { useEffect, useState } from 'react';
import '../admin/AdminDashboard.css';
import Sidebar from '../../components/Sidebar';
import DashboardCalendar from '../../components/DashboardCalendar';
import axiosClient from '../../axiosClient';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

function CookDashboard() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_events: 0,
    menu_items_completed: 0,
    menu_items_pending: 0,
    foods_to_prepare: [],
  });

  const [todayEvents, setTodayEvents] = useState([]);

  useEffect(() => {
    // Stats (weekly and totals)
    axiosClient.get('/dashboard/cook/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error fetching cook stats', err));

    // Today's Events
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
            <div className="stat-box">Menu Items Pending Today <span>{stats.menu_items_pending}</span></div>
            <div className="stat-box">
              Total To Prepare This Week{" "}
              <span>
                {Array.isArray(stats.foods_to_prepare)
                  ? stats.foods_to_prepare.reduce(
                      (total, day) =>
                        total +
                        (day.foods?.filter(food => food.status !== "completed").length || 0),
                      0
                    )
                  : 0}
              </span>
            </div>
          </div>
        </section>

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
            <h3>To Prepare</h3>
            {Array.isArray(stats.foods_to_prepare) && stats.foods_to_prepare.length > 0 ? (
              <div className="to-prepare-list">
                {stats.foods_to_prepare.map((day, index) => {
                  const groupedByEvent = day.foods?.reduce((acc, food) => {
                    if (!acc[food.event_name]) acc[food.event_name] = [];
                    acc[food.event_name].push(food);
                    return acc;
                  }, {}) || {};

                  return (
                    <div className="prepare-day" key={index}>
                      <h4 className="prepare-date">{day.date}</h4>

                      {Object.entries(groupedByEvent).map(([eventName, foods], eIndex) => (
                        <div key={eIndex} className="event-group">
                          <h5 className="event-name">{eventName}</h5>
                          <ul>
                            {foods.map((food, i) => (
                              <li key={i} className="prepare-item">
                                <span className="food-name">{food.food_name}</span>
                                <span className={`food-status ${food.status?.toLowerCase()}`}>
                                  {food.status}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="empty-list">No items to prepare for today or tomorrow.</p>
            )}
          </aside>

        </section>

      </div>
    </div>
  );
}

export default CookDashboard;