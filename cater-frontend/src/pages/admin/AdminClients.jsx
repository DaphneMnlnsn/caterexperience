import React, { useEffect, useState } from 'react';
import './AdminClients.css';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { FaBell, FaInfoCircle } from 'react-icons/fa';
import axiosClient from '../../axiosClient';

function AdminClients() {
    
    const [customerData, setCustomerData] = React.useState([]);
    const user = JSON.parse(localStorage.getItem('user'));
    const [selectedCustomer, setSelectedCustomer] = React.useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        axiosClient.get('/customers')
        .then(res => {
            setCustomerData(res.data.customers);
        })
        .catch(err => console.error('Failed to fetch clients:', err.response?.data || err.message));
    }, []);
    
    const filteredCustomers = customerData.filter(customer => {
        const fullName = `${customer.customer_firstname} ${customer.customer_middlename} ${customer.customer_lastname}`.toLowerCase();
        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            customer.customer_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.customer_address.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    
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

                <section className="client-header">
                    <h3>Client Management</h3>
                    <div className="client-header-actions">
                        <div className="client-search-box">
                            <input
                            type="text"
                            placeholder="🔍 Search client by name, phone, or address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <section className="dashboard-bottom">
                    <div className="staff-table-container">
                        <table className="staff-table">
                            <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Contact No.</th>
                                <th>Address</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer, index) => (
                                    <tr key={index}>
                                        <td>{customer.customer_firstname} {customer.customer_middlename} {customer.customer_lastname}</td>
                                        <td>{customer.customer_phone}</td>
                                        <td>{customer.customer_address}</td>
                                        <td className="actions">
                                            <Link to={`/admin/clients/${customer.customer_id}`}>
                                                <FaInfoCircle className="icon edit-icon" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AdminClients;