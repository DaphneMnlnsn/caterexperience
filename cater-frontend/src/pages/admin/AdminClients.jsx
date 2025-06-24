import React from 'react';
import './AdminClients.css';
import Sidebar from '../../components/Sidebar';
import { FaBell, FaInfoCircle } from 'react-icons/fa';

function AdminClients() {
    const staffData = [
        { name: 'Kiana Landau', contact: '09876524321', address: 'Pandi, Bulacan' },
        { name: 'Lance Lot', contact: '09876542324', address: 'Obando, Bulacan' },
        { name: 'Reggie Estrella', contact: '09328482732', address: 'Pandi, Bulacan' },
    ];
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

                <section className="client-header">
                    <h3>Client Management</h3>
                    <div className="client-header-actions">
                        <div className="client-search-box">
                            <input type="text" placeholder="🔍 Search" />
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
                                {staffData.map((staff, index) => (
                                    <tr key={index}>
                                        <td>{staff.name}</td>
                                        <td>{staff.contact}</td>
                                        <td>{staff.address}</td>
                                        <td className="actions">
                                            <FaInfoCircle className="icon edit-icon" />
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