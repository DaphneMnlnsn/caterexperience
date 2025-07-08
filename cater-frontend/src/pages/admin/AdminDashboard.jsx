import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import Sidebar from '../../components/Sidebar';
import DashboardCalendar from '../../components/DashboardCalendar';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';
import axiosClient from '../../axiosClient';

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  const [stats, setStats] = useState({
    total_events: 0,
    pending_bookings: 0,
    pending_payments: 0,
    staff_tasks: 0,
  });

  const [auditLog, setAuditLog] = useState([]);

  useEffect(() => {
    axiosClient.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error fetching stats', err));

    axiosClient.get('/dashboard/audit-log')
      .then(res => setAuditLog(res.data))
      .catch(err => console.error('Error fetching audit log', err));
  }, []);

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

        <section className="welcome-section">
          <h3>Welcome, {user ? user.first_name : 'User'}!</h3>
          <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <div className="stats">
            <div className="stat-box">Total of Events <span>{stats.total_events}</span></div>
            <div className="stat-box">Pending Booking <span>{stats.pending_bookings}</span></div>
            <div className="stat-box">Pending Payments <span>{stats.pending_payments}</span></div>
            <div className="stat-box">Staff To-Do Tasks <span>{stats.staff_tasks}</span></div>
          </div>
        </section>

        <section className="dashboard-bottom">
          <div className="calendar-section">
            <DashboardCalendar />
          </div>

          <aside className="audit-log">
            <h3>Audit Log</h3>
            <ul>
              {auditLog.map((log, index) => (
                <li key={index}>
                  {log.user_name} <span>{log.details ?? log.action}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
