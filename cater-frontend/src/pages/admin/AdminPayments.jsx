import React, { useEffect, useState } from 'react';
import './AdminUsers.css';
import Sidebar from '../../components/Sidebar';
import { FaReceipt } from 'react-icons/fa';
import axiosClient from '../../axiosClient';
import Invoice from '../../components/Invoice';
import dayjs from 'dayjs';
import Header from '../../components/Header';

function AdminPayments() {
    const [paymentData, setPaymentData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);
    const storedUser = localStorage.getItem('user');
const user = storedUser ? JSON.parse(atob(storedUser)) : null;
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        method: '',
        from: '',
        to: ''
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const clearFilters = () => {
        setFilters({ search: '', method: '', from: '', to: '' });
    };

    const applyPreset = (days) => {
        const to = dayjs().format('YYYY-MM-DD');
        const from = dayjs().subtract(days, 'day').format('YYYY-MM-DD');
        setFilters((prev) => ({ ...prev, from, to }));
    };

    useEffect(() => {
        fetchPayments(); 
    }, []);

    const fetchPayments = () => {
        axiosClient.get('/payments')
        .then(res => {
            setPaymentData(res.data.payments);
        })
        .catch(err => console.error('Failed to fetch payment records:', err.response?.data || err.message));
    };

    const filteredPayments = paymentData.filter(p => {
        const fullName = `${p.booking?.customer?.customer_firstname} ${p.booking?.customer?.customer_lastname}`.toLowerCase();
        const eventName = p.booking?.event_name?.toLowerCase() || '';
        const remarks = p.remarks?.toLowerCase() || '';
        const paymentMethod = p.payment_method || '';

        const searchMatch =
            fullName.includes(filters.search.toLowerCase()) ||
            eventName.includes(filters.search.toLowerCase()) ||
            remarks.includes(filters.search.toLowerCase()) ||
            paymentMethod.toLowerCase().includes(filters.search.toLowerCase());

        const methodMatch = filters.method ? paymentMethod === filters.method : true;

        const paymentDate = dayjs(p.payment_date);
        const fromDate = filters.from ? dayjs(filters.from) : null;
        const toDate = filters.to ? dayjs(filters.to) : null;

        const dateMatch =
            (!fromDate || paymentDate.isSame(fromDate) || paymentDate.isAfter(fromDate)) &&
            (!toDate || paymentDate.isSame(toDate) || paymentDate.isBefore(toDate));

        return searchMatch && methodMatch && dateMatch;
    });

    const handleGenerateReport = () => {
        const params = new URLSearchParams();

        if (filters.from) params.append("start_date", filters.from);
        if (filters.to) params.append("end_date", filters.to);
        if (filters.method) params.append("payment_method", filters.method);
        if (filters.search) params.append("client_name", filters.search);
        
        const fullName = user ? `${user.first_name} ${user.last_name}` : 'Unknown';
        params.append("generated_by", fullName);

        window.open(`${process.env.REACT_APP_BASE_URL}/api/payments/report?${params.toString()}`, '_blank');
    };

    return (
        <div className="page-container">
            <Sidebar />

            <div className="main-content">
                <Header user={user} />

                <section className="page-header">
                    <h3>Payment Records</h3>
                    <div className="page-header-actions">
                        <div className="search-box">
                            <input
                            type="text"
                            name="search"
                            placeholder="🔍 Search payment record by customer name or event name..."
                            value={filters.search}
                            onChange={handleFilterChange}
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
                            name="method"
                            value={filters.method}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Methods</option>
                            <option value="Cash">Cash</option>
                            <option value="GCash">GCash</option>
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
                                    <th>Transact. #</th>
                                    <th>Client Name</th>
                                    <th>Event Name</th>
                                    <th>Amount Paid</th>
                                    <th>Remarks</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map((payment, index) => (
                                    <tr key={index}>
                                        <td>R-{String(payment.payment_id).padStart(5, '0')}</td>
                                        <td>{payment.booking?.customer?.customer_firstname}  {payment.booking?.customer?.customer_middlename ? payment.booking?.customer?.customer_middlename + ' ' : ''}{payment.booking?.customer?.customer_lastname}</td>
                                        <td>{payment.booking?.event_name}</td>
                                        <td>{parseFloat(payment.amount_paid).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</td>
                                        <td>
                                            {payment.remarks}
                                        </td>
                                        <td>
                                            <FaReceipt className="icon edit-icon" onClick={() => {
                                                setShowInvoice(true);
                                                setSelectedPayment(payment.payment_id);
                                            }}/>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPayments.length === 0 && (
                                    <td>No payments found.</td>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            <Invoice show={showInvoice} onClose={() => setShowInvoice(false)} selectedPayment={selectedPayment}/>
        </div>
    );
}

export default AdminPayments;