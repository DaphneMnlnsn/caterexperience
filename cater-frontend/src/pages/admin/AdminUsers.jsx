import React from 'react';
import './AdminUsers.css';
import Sidebar from '../../components/Sidebar';
import { FaBell, FaFilter, FaPen, FaTrash } from 'react-icons/fa';

function AdminUsers() {
    const staffData = [
        { name: 'Kiana Landau', contact: '09876524321', role: 'Cook', tasks: 10 },
        { name: 'Lance Lot', contact: '09876542324', role: 'Head Waiter', tasks: 7 },
        { name: 'Reggie Estrella', contact: '09328482732', role: 'Stylist', tasks: 6 },
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

                <section className="staff-header">
                    <h3>Staff Management</h3>
                    <div className="staff-header-actions">
                        <div className="search-box">
                            <input type="text" placeholder="🔍 Search" />
                        </div>
                        <div className="spacer" />
                        <div className="button-group">
                            <button className="add-btn">+ Add New Staff</button>
                            <button className="filter-btn"><FaFilter /></button>
                        </div>
                    </div>
                </section>

                <section className="dashboard-bottom">
                    <div className="staff-table-container">
                        <table className="staff-table">
                            <thead>
                            <tr>
                                <th>Staff Name</th>
                                <th>Contact No.</th>
                                <th>Role</th>
                                <th>Current Tasks</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                                {staffData.map((staff, index) => (
                                    <tr key={index}>
                                        <td>{staff.name}</td>
                                        <td>{staff.contact}</td>
                                        <td>{staff.role}</td>
                                        <td>{staff.tasks}</td>
                                        <td className="actions">
                                            <FaPen className="icon edit-icon" />
                                            <FaTrash className="icon delete-icon" />
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

export default AdminUsers;