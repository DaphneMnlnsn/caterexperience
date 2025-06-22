import React from 'react';
import './AdminDashboard.css';
import Sidebar from '../../components/Sidebar';
import DashboardCalendar from '../../components/DashboardCalendar';
import { FaBell } from 'react-icons/fa';

function AdminDashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left"></div>
          <div className="topbar-right">
            <span className="user-name">Jen Tarriela</span>
            <FaBell className="notif-icon" />
          </div>
        </header>

        <section className="welcome-section">
          <h3>Welcome, Jen!</h3>
          <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <div className="stats">
            <div className="stat-box">Total of Events <span>2</span></div>
            <div className="stat-box">Pending Booking <span>2</span></div>
            <div className="stat-box">Pending Payments <span>2</span></div>
            <div className="stat-box">Staff To-Do Tasks <span>2</span></div>
          </div>
        </section>

        <section className="dashboard-bottom">
          <div className="calendar-section">
            <DashboardCalendar />
          </div>

          <aside className="audit-log">
            <h3>Audit Log</h3>
            <ul>
              {Array.from({ length: 10 }, (_, i) => (
                <li key={i}>
                  Staff {i + 1} <span>finished a task</span>
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