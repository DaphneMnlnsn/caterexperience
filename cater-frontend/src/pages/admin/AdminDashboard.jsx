import React, { useEffect, useState } from 'react';
import { ToastContainer } from "react-toastify";
import './AdminDashboard.css';
import Sidebar from '../../components/Sidebar';
import DashboardCalendar from '../../components/DashboardCalendar';
import { FaBell } from 'react-icons/fa';
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
    <div className="page-container">
      <Sidebar />

      <div className="main-content">
        <Header user={user} />

        <section className="welcome-section">
          <h3>Welcome, {user ? user.first_name : 'User'}!</h3>
          <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <div className="stats">
            <div className="stat-box">Total Events <span>{stats.total_events}</span></div>
            <div className="stat-box">Pending Booking <span>{stats.pending_bookings}</span></div>
            <div className="stat-box">Pending Payments <span>{stats.pending_payments}</span></div>
            <div className="stat-box">Staff To-Do Tasks <span>{stats.staff_tasks}</span></div>
          </div>
        </section>

        <section className="page-bottom">
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
