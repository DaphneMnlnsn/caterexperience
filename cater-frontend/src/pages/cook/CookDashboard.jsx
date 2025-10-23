import React, { useEffect, useState } from 'react';
import '../admin/AdminDashboard.css';
import Sidebar from '../../components/Sidebar';
import DashboardCalendar from '../../components/DashboardCalendar';
import axiosClient from '../../axiosClient';
import Header from '../../components/Header';

function CookDashboard() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;

  const [stats, setStats] = useState({
    total_events: 0,
    menu_items_completed: 0,
    menu_items_pending: 0,
    foods_to_prepare: {},
  });

  const [toPrepare, setToPrepare] = useState([]);

  useEffect(() => {
    axiosClient.get('/dashboard/cook/stats')
      .then(res => {
        const data = res.data;
        setStats(data);
        setToPrepare(Array.isArray(data.foods_to_prepare) ? data.foods_to_prepare : []);
      })
      .catch(err => console.error('Error fetching stats', err));
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
            <div className="stat-box">Total Events <span>{stats.total_events}</span></div>
            <div className="stat-box">Menu Items to Prepare 
              <span>
                {Array.isArray(stats.foods_to_prepare)
                  ? stats.foods_to_prepare.reduce((total, day) => total + (day.foods?.length || 0), 0)
                  : 0}
              </span>
            </div>
            <div className="stat-box">Menu Items Completed <span>{stats.menu_items_completed}</span></div>
            <div className="stat-box">Menu Items Pending <span>{stats.menu_items_pending}</span></div>
          </div>
        </section>

        <section className="page-bottom">
          <div className="calendar-section">
            <DashboardCalendar />
          </div>

          <aside className="audit-log">
            <h3>To Prepare</h3>
            {toPrepare.length > 0 ? (
              <div className="to-prepare-list">
                {toPrepare.map((day, index) => (
                  <div className="prepare-day" key={index}>
                    <h4 className="prepare-date">{day.date}</h4>
                    <ul>
                      {day.foods.map((food, i) => (
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
