import React, { useEffect, useState } from 'react';
import '../admin/AdminDashboard.css';
import Sidebar from '../../components/Sidebar';
import DashboardCalendar from '../../components/DashboardCalendar';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';
import axiosClient from '../../axiosClient';

function WaiterDashboard() {
  const storedUser = localStorage.getItem('user');
const user = storedUser ? JSON.parse(atob(storedUser)) : null;

  const [stats, setStats] = useState({
    total_events: 0,
    call_time: "N/A",
    inventory_updates: [],
    finished_events: 0,
    setup_checklist: []
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    const d = new Date(timeStr);
    if (isNaN(d)) return "N/A";
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  useEffect(() => {
    axiosClient.get('/dashboard/waiter/stats')
      .then(res => {
        setStats(res.data);
      })
      .catch(err => console.error('Error fetching waiter stats', err));
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
            <FaBell className="notif-icon" />
          </div>
        </header>

        <section className="welcome-section">
          <h3>Welcome, {user ? user.first_name : 'User'}!</h3>
          <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <div className="stats">
            <div className="stat-box">Total Events <span>{stats.total_events}</span></div>
            <div className="stat-box">Inventory Items to Update <span>
              {stats.inventory_updates && typeof stats.inventory_updates === "object"
                ? Object.keys(stats.inventory_updates).length : 0}
              </span></div>
            <div className="stat-box">Call Time <span>{formatTime(stats.call_time)}</span></div>
            <div className="stat-box">Finished Events <span>{stats.finished_events}</span></div>
          </div>
        </section>

        <section className="page-bottom">
          <div className="calendar-section">
            <DashboardCalendar />
          </div>

          <aside className="audit-log">
            <h3>Setup Checklist</h3>
            <ul>
              {stats.setup_checklist.length > 0 ? (
                stats.setup_checklist.map((event, idx) => (
                  <li key={idx}>
                    <strong>Event Name: {event.event_name}</strong><br />
                    Date: {formatDate(event.event_date)} <br />
                    Start: {
                      event.event_start ? new Date(`1970-01-01T${event.event_start}`).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'
                    } <br />                    
                    Call Time: {formatTime(event.call_time)} <br />
                    <strong>To Set Up:</strong>
                    <ul className='setup-checklist'>
                      {event.inventory.map((inv, invIdx) => (
                        <li key={invIdx}>
                          - {inv.quantity_assigned} {inv.item_name}
                        </li>
                      ))}
                      <li>
                        - {event.waiters} waiters
                      </li>
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
