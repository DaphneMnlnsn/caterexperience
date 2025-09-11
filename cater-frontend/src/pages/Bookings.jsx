import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { FaBell, FaInfoCircle } from 'react-icons/fa';
import Header from '../components/Header';
import axiosClient from '../axiosClient';
import { Link } from 'react-router-dom';
import './Bookings.css';

function Bookings() {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(atob(storedUser)) : null;

    const [bookings, setBookings] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [statusFilter, setStatusFilter] = useState("pending");

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/events/assigned', {
                params: { page, per_page: perPage }
            });

            setBookings(res.data.bookings || []);
            if (res.data.pagination) {
                setPagination(res.data.pagination);
                setPage(res.data.pagination.current_page || page);
                setPerPage(res.data.pagination.per_page || perPage);
            }
        } catch (err) {
            console.error('Failed to fetch bookings:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [page, perPage]);

    const filteredBookings = bookings.filter(b => {
        const fullName = `${b.customer.customer_firstname} ${b.customer.customer_middlename ? b.customer.customer_middlename + ' ' : ''}${b.customer.customer_lastname}`.toLowerCase();
        const matchesSearch =
            b.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fullName.includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter ? b.booking_status.toLowerCase() === statusFilter.toLowerCase() : true;

        return matchesSearch && matchesStatus;
    });

    const renderPageButtons = () => {
        const pages = [];
        const current = pagination.current_page || page;
        const last = pagination.last_page || 1;
        const start = Math.max(1, current - 3);
        const end = Math.min(last, current + 3);

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push('gap-start');
        }
        for (let p = start; p <= end; p++) pages.push(p);
        if (end < last) {
            if (end < last - 1) pages.push('gap-end');
            pages.push(last);
        }

        return pages.map((p, i) => {
            if (p === 'gap-start' || p === 'gap-end') {
                return <button key={`gap-${i}`} className="page-gap" disabled>...</button>;
            }
            return (
                <button
                    key={p}
                    className={`page-btn ${p === current ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                    disabled={p === current || loading}
                >
                    {p}
                </button>
            );
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        const date = new Date();
        date.setHours(hour);
        date.setMinutes(minute);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderStatus = (status) => {
        const statusMap = {
            pending: 'status-pending',
            cancelled: 'status-cancelled',
            finished: 'status-finished',
        };
        const className = statusMap[status.toLowerCase()] || 'status-default';
        return <span className={`status-label ${className}`}>{status}</span>;
    };

    return (
        <div className="page-container">
            <Sidebar />

            <div className="main-content">
                <Header user={user} />

                <section className="client-header">
                    <h3>My Assigned Bookings</h3>
                    <div className="client-header-actions">
                        <select
                            className="filter-input"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="finished">Finished</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <div className="client-search-box">
                            <input
                                type="text"
                                placeholder="🔍 Search by event, or client..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>
                </section>

                <section className="page-bottom">
                    <div className="table-container">
                        <table className="page-table">
                            <thead>
                                <tr>
                                    <th>Event Name</th>
                                    <th>Client</th>
                                    <th>Event Date & Time</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5}>Loading...</td></tr>
                                ) : filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking, index) => (
                                        <tr key={index}>
                                            <td>{booking.event_name}</td>
                                            <td>
                                                {booking.customer.customer_firstname}{' '}
                                                {booking.customer.customer_middlename ? booking.customer.customer_middlename + ' ' : ''}
                                                {booking.customer.customer_lastname}
                                            </td>
                                            <td>
                                                {booking.event_date} <br />
                                                {formatTime(booking.event_start_time)} - {formatTime(booking.event_end_time)}
                                            </td>
                                            <td>{renderStatus(booking.booking_status)}</td>
                                            <td className="booking-actions">
                                                <Link to={`/bookings/${booking.booking_id}`} className="info-link">
                                                    <FaInfoCircle className='icon edit-icon'/>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5">No bookings found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                        <button
                            className="page-btn"
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page <= 1 || loading}
                        >
                            Prev
                        </button>

                        {renderPageButtons()}

                        <button
                            className="page-btn"
                            onClick={() => setPage(prev => Math.min(pagination.last_page, prev + 1))}
                            disabled={page >= (pagination.last_page || 1) || loading}
                        >
                            Next
                        </button>

                        <div style={{ marginLeft: 'auto' }}>
                            <small>Page {pagination.current_page} of {pagination.last_page} — {pagination.total} total</small>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Bookings;