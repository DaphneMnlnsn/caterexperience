import React, { useEffect, useState } from 'react';
import './AdminUsers.css';
import Sidebar from '../../components/Sidebar';
import Swal from 'sweetalert2';
import { FaBell, FaPen, FaTrash, FaReceipt } from 'react-icons/fa';
import axiosClient from '../../axiosClient';
import Invoice from '../../components/Invoice';

function AdminPayments() {
    const [paymentData, setPaymentData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredPayments = paymentData.filter(payment => {
        const fullName = `${payment.booking?.customer?.customer_firstname} ${payment.booking?.customer?.customer_lastname}`;
        const event = payment.booking?.event_name || '';
        const remarks = payment.remarks || '';

        return (
            remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

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
                    <h3>Payment Records</h3>
                    <div className="page-header-actions">
                        <div className="search-box">
                            <input
                            type="text"
                            placeholder="🔍 Search payment record by event name, payment method, or remarks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="spacer" />
                        <div className="button-group">
                            <button className="add-btn" onClick={() => {setShowModal(true);}}>Generate Report</button>
                        </div>
                    </div>
                </section>

                <section className="page-bottom">
                    <div className="table-container">
                        <table className="page-table">
                            <thead>
                                <tr>
                                    <th>No.</th>
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
                                        <td>{payment.payment_id}</td>
                                        <td>{payment.booking?.customer?.customer_firstname} {payment.booking?.customer?.customer_lastname}</td>
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