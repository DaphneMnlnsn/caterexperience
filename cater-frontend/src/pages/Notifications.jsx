import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { FaInfoCircle, FaSearch, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axiosClient from '../axiosClient';
import './Bookings.css';

function Notifications() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('unread');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

    const filteredNotifications = notifications.filter(n => {
        const message = n.data.message || '';
        const matchesSearch = message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' ? true : (statusFilter === 'unread' ? !n.read_at : !!n.read_at);
        return matchesSearch && matchesStatus;
    });


  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Failed to delete notification:', err.response?.data || err.message);
            alert('Failed to delete notification. Please try again.');
        }
    };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content">
        <Header user={user} />

        <section className="client-header">
          <h3>Notifications</h3>
          <div className="client-header-actions">
            <select
              className="filter-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="page-bottom">
          <div className="table-container">
            <table className="page-table">
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4}>Loading...</td></tr>
                ) : filteredNotifications.length > 0 ? (
                  filteredNotifications.map((n, index) => (
                    <tr key={index} className={!n.read_at ? 'notifications-unread' : ''}>
                      <td>{n.data.message}</td>
                      <td>{formatDateTime(n.created_at)}</td>
                      <td>{n.read_at ? 'Read' : 'Unread'}</td>
                      <td className='actions'>
                        {n.data.url && (
                          <Link to={n.data.url} className="info-link">
                            <FaInfoCircle className="icon info-icon" />
                          </Link>
                        )}
                        <FaTrash className="icon delete-icon" onClick={() => handleDelete(n.id)}/>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4">No notifications found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Notifications;
