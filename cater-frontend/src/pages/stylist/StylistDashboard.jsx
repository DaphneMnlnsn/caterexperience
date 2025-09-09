import React, { useEffect, useState } from 'react';
import '../admin/AdminDashboard.css';
import Sidebar from '../../components/Sidebar';
import DashboardCalendar from '../../components/DashboardCalendar';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';
import axiosClient from '../../axiosClient';
import NotificationsDropdown from '../../components/NotificationsDropdown';

function StylistDashboard() {
  const storedUser = localStorage.getItem('user');
const user = storedUser ? JSON.parse(atob(storedUser)) : null;

  const [stats, setStats] = useState({
    total_events: 0,
    setup_plans_due: 0,
    setup_plans_submitted: 0,
    todo_tasks: 0,
  });

  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    axiosClient.get('/dashboard/stylist/stats')
      .then(res => {
        setStats(res.data);
        setDeadlines(res.data.deadlines || []);
      })
      .catch(err => console.error('Error fetching stats', err));
  }, []);

  return (
    <div className="page-container">
      <Sidebar />

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left"></div>
          <div className="topbar-right">
            <span className="user-name">
              {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
            </span>
            <NotificationsDropdown />
          </div>
        </header>

        <section className="welcome-section">
          <h3>Welcome, {user ? user.first_name : 'User'}!</h3>
          <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <div className="stats">
            <div className="stat-box">Total Events <span>{stats.total_events}</span></div>
            <div className="stat-box">Setup Plans Due <span>{stats.setup_plans_due}</span></div>
            <div className="stat-box">Setup Plans Submitted <span>{stats.setup_plans_submitted}</span></div>
            <div className="stat-box">To-Do Tasks <span>{stats.todo_tasks}</span></div>
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
                    <span> – due {new Date(deadline.due_date).toLocaleDateString()}</span>
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
