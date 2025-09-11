import React, { useEffect, useState } from 'react';
import '../admin/AdminDashboard.css';
import Sidebar from '../../components/Sidebar';
import DashboardCalendar from '../../components/DashboardCalendar';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';
import axiosClient from '../../axiosClient';
import NotificationsDropdown from '../../components/NotificationsDropdown';
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
        setStats(res.data);
        setToPrepare(res.data.foods_to_prepare);
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
            <div className="stat-box">Menu Items to Prepare <span>{stats.foods_to_prepare.length}</span></div>
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
            <ul>
              {toPrepare.length > 0 ? (
                toPrepare.map(([date, foods]) => (
                  <li key={date}>
                    <div>
                      <h4>{date}</h4>
                      <ul>
                        {foods.map((food, index) => (
                          <li key={index}>
                            {food.food_name} <span>({food.status})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))
              ) : (
                <li>No items to prepare for today/tomorrow</li>
              )}
            </ul>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default CookDashboard;
