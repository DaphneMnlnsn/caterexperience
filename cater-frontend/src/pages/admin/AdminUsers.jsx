import React, { useEffect, useState } from 'react';
import './AdminUsers.css';
import AddUserModal from '../../components/AddUserModal';
import EditUserModal from '../../components/EditUserModal';
import Sidebar from '../../components/Sidebar';
import Swal from 'sweetalert2';
import { FaBell, FaFilter, FaPen, FaTrash } from 'react-icons/fa';

function AdminUsers() {
    const [staffData, setStaffData] = React.useState([]);
    const [showModal, setShowModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);

    const handleSaveUser = () => {
        fetch('http://localhost:8000/api/users')
            .then(res => res.json())
            .then(data => {
            setStaffData(data.users);
        });
    };

    useEffect(() => {
        fetch('http://localhost:8000/api/users')
            .then(res => res.json())
            .then(data => {
                setStaffData(data.users);
            })
            .catch(err => console.error('Failed to fetch users:', err));
    }, []);

    const handleDeleteUser = (user) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `This will permanently delete ${user.first_name} ${user.last_name}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
            fetch(`http://localhost:8000/api/users/${user.id}`, {
                method: 'DELETE',
            })
                .then(res => {
                if (!res.ok) throw new Error('Failed to delete user');
                return res.json();
                })
                .then(() => {
                Swal.fire('Deleted!', 'User has been deleted.', 'success');
                setStaffData(prev => prev.filter(u => u.id !== user.id));
                })
                .catch(err => {
                console.error('Delete error:', err);
                Swal.fire('Error', 'Could not delete user.', 'error');
                });
            }
        });
    };

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
                            <button className="add-btn" onClick={() => {setShowModal(true);}}>+ Add New Staff</button>
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
                                {staffData.map((user, index) => (
                                    <tr key={index}>
                                    <td>{user.first_name} {user.last_name}</td>
                                    <td>{user.user_phone}</td>
                                    <td>{user.role}</td>
                                    <td>{user.tasks || 0}</td>
                                    <td className="actions">
                                        <FaPen className="icon edit-icon" onClick={() => {
                                        setSelectedUser(user);
                                        setShowEditModal(true);
                                        }}/>
                                        <FaTrash className="icon delete-icon" onClick={() => handleDeleteUser(user)} />
                                    </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            <AddUserModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveUser}
            />
            <EditUserModal
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveUser}
            user={selectedUser}
            />
        </div>
    );
}

export default AdminUsers;