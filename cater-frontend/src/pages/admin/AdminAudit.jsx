import React, { useEffect, useState } from 'react';
import './AdminUsers.css';
import Sidebar from '../../components/Sidebar';
import Swal from 'sweetalert2';
import { FaBell } from 'react-icons/fa';
import axiosClient from '../../axiosClient';
import dayjs from 'dayjs';

function AdminAudit() {
  const [auditData, setAuditData] = useState([]);
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;

  const [filters, setFilters] = useState({
    search: '',
    action: '',
    from: '',
    to: ''
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(filters.search), 450);
    return () => clearTimeout(id);
  }, [filters.search]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);

    if (name === 'search' && value === '') {
        setDebouncedSearch('');
    }
  };

  const clearFilters = () => {
    setFilters({ search: '', action: '', from: '', to: '' });
    setDebouncedSearch('');
    setPage(1);
  };

  const applyPreset = (days) => {
    const to = dayjs().format('YYYY-MM-DD');
    const from = dayjs().subtract(days, 'day').format('YYYY-MM-DD');
    setFilters(prev => ({ ...prev, from, to }));
    setPage(1);
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage
      };
      if (filters.from) params.start_date = filters.from;
      if (filters.to) params.end_date = filters.to;
      if (filters.action) params.action = filters.action;
      if (debouncedSearch) params.user = debouncedSearch;

      const res = await axiosClient.get('/audit', { params });

      setAuditData(res.data.logs || []);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
        setPage(res.data.pagination.current_page || page);
        setPerPage(res.data.pagination.per_page || perPage);
      } else {
        setPagination(prev => ({ ...prev, per_page: perPage }));
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data || err.message;
      console.error('Failed to fetch audit logs:', err.response?.data || err.message);
      Swal.fire('Error', String(serverMsg), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, perPage, debouncedSearch, filters.action, filters.from, filters.to]);

  const handleGenerateReport = () => {
    const params = new URLSearchParams();

    if (filters.from) params.append("start_date", filters.from);
    if (filters.to) params.append("end_date", filters.to);
    if (filters.action) params.append("action", filters.action);
    if (filters.search) params.append("user", filters.search);

    const fullName = user ? `${user.first_name} ${user.last_name}` : 'Unknown';
    params.append("generated_by", fullName);

    window.open(`http://localhost:8000/api/audit/report?${params.toString()}`, '_blank');
  };

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

        <section className="page-header">
          <h3>Audit Log</h3>
          <div className="page-header-actions">
            <div className="search-box">
              <input
                type="text"
                name="search"
                placeholder="🔍 Search log by user name..."
                value={filters.search}
                onChange={handleFilterChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setDebouncedSearch(filters.search);
                  }
                }}
              />
            </div>
            <div className="spacer" />
            <div className="button-group">
              <button className="add-btn" onClick={handleGenerateReport}>Generate Report</button>
            </div>
          </div>
        </section>

        <section className="page-bottom">
          <div className="filters-container">
            <select
              className="filter-input"
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
            >
              <option value="">All Actions</option>
              <option value="Login">Login</option>
              <option value="Logout">Logout</option>
              <option value="Viewed">Viewed</option>
              <option value="Created">Created</option>
              <option value="Updated">Updated</option>
            </select>

            <input
              className="filter-input"
              type="date"
              name="from"
              value={filters.from}
              max={dayjs().format('YYYY-MM-DD')}
              onChange={handleFilterChange}
            />
            <input
              className="filter-input"
              type="date"
              name="to"
              value={filters.to}
              min={filters.from}
              max={dayjs().format('YYYY-MM-DD')}
              onChange={handleFilterChange}
              disabled={!filters.from}
            />
            <button className="add-btn" onClick={clearFilters}>Clear Filters</button>
          </div>

          <div className="filters-container" style={{ marginTop: '5px' }}>
            <button className="add-btn" onClick={() => applyPreset(7)}>Last 7 Days</button>
            <button className="add-btn" onClick={() => applyPreset(30)}>Last 30 Days</button>
            <button className="add-btn" onClick={() => applyPreset(90)}>Last 90 Days</button>
          </div>

          <div className="table-container">
            <table className="page-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5}>Loading...</td></tr>
                ) : auditData.length === 0 ? (
                  <tr><td colSpan={5}>No logs found.</td></tr>
                ) : (
                  auditData.map((log, index) => (
                    <tr key={index}>
                      <td>{log.user ? `${log.user.first_name} ${log.user.middle_name ? log.user.middle_name + " " : ""}${log.user.last_name}` : 'Guest'}</td>
                      <td>{log.user?.role}</td>
                      <td>{log.action}</td>
                      <td>{log.details}</td>
                      <td>{log.timestamp}</td>
                    </tr>
                  ))
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
              onClick={() => setPage(prev => Math.min(pagination.last_page || prev + 1, (pagination.last_page || prev + 1)))}
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

export default AdminAudit;
