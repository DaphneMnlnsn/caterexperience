import React, { useEffect, useState } from 'react';
import './AdminClients.css';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { FaInfoCircle } from 'react-icons/fa';
import axiosClient from '../../axiosClient';
import Header from '../../components/Header';

function AdminClients() {
    
    const [customerData, setCustomerData] = React.useState([]);
    const storedUser = localStorage.getItem('user');
const user = storedUser ? JSON.parse(atob(storedUser)) : null;
    const [selectedCustomer, setSelectedCustomer] = React.useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showArchived, setShowArchived] = useState(0);

    useEffect(() => {
        axiosClient.get('/customers')
        .then(res => {
            setCustomerData(res.data.customers);
        })
        .catch(err => console.error('Failed to fetch clients:', err.response?.data || err.message));
    }, []);
    
    const displayedCustomers = customerData.filter(c => !!c.archived === !!showArchived);

    const filteredCustomers = displayedCustomers.filter(customer => {
        const fullName = `${customer.customer_firstname} ${customer.customer_middlename} ${customer.customer_lastname}`.toLowerCase();
        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            customer.customer_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.customer_address.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="page-container">
            <Sidebar />

            <div className="main-content">
                <Header user={user} />

                <section className="client-header">
                    <h3>Client Management</h3>
                    <div className="client-header-actions">
                        <button
                        className="edit-btn"
                        onClick={() => setShowArchived(!showArchived)}
                        >
                            {showArchived ? 'Show Active Clients' : 'Show Archived Clients'}
                        </button>
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

                <section className="page-bottom">
                    <div className="table-container">
                        <table className="page-table">
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
                                        <td>{customer.customer_firstname} {customer.customer_middlename ? customer.customer_middlename + ' ' : ''}{customer.customer_lastname}</td>
                                        <td>{customer.customer_phone}</td>
                                        <td>{customer.customer_address}</td>
                                        <td className="actions">
                                            <Link to={`/admin/clients/${customer.customer_id}`}>
                                                <FaInfoCircle className="icon edit-icon" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCustomers.length === 0 && (
                                    <td>No clients found.</td>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AdminClients;