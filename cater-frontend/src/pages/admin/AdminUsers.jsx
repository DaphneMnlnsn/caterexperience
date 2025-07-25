import React, { useEffect, useState } from 'react';
import './AdminUsers.css';
import AddUserModal from '../../components/AddUserModal';
import EditUserModal from '../../components/EditUserModal';
import Sidebar from '../../components/Sidebar';
import Swal from 'sweetalert2';
import { FaBell, FaFilter, FaPen, FaTrash } from 'react-icons/fa';
import axiosClient from '../../axiosClient';

function AdminUsers() {
    const [staffData, setStaffData] = React.useState([]);
    const [showModal, setShowModal] = React.useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const formatRole = (role) => {
        return role
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleSaveUser = () => {
        axiosClient.get('/users')
        .then(res => {
            setStaffData(res.data.users);
        });
    };

    useEffect(() => {
        axiosClient.get('/users')
        .then(res => {
            setStaffData(res.data.users);
        })
        .catch(err => console.error('Failed to fetch users:', err.response?.data || err.message));
    }, []);

    const filteredUsers = staffData.filter(user => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            user.user_phone.includes(searchTerm) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

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
                axiosClient.delete(`/users/${user.id}`)
                .then(() => {
                    Swal.fire('Deleted!', 'User has been deleted.', 'success');
                    setStaffData(prev => prev.filter(u => u.id !== user.id));
                })
                .catch(err => {
                    console.error('Delete error:', err.response?.data || err.message);
                    Swal.fire('Error', 'Could not delete user.', 'error');
                });
            }
        });
    }

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
                    <h3>Staff Management</h3>
                    <div className="page-header-actions">
                        <div className="search-box">
                            <input
                            type="text"
                            placeholder="🔍 Search staff by name, phone, or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="spacer" />
                        <div className="button-group">
                            <button className="add-btn" onClick={() => {setShowModal(true);}}>+ Add New Staff</button>
                        </div>
                    </div>
                </section>

                <section className="page-bottom">
                    <div className="table-container">
                        <table className="page-table">
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
                                {filteredUsers.map((user, index) => (
                                    <tr key={index}>
                                    <td>{user.first_name} {user.last_name}</td>
                                    <td>{user.user_phone}</td>
                                    <td>{formatRole(user.role)}</td>
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
                                {filteredUsers.length === 0 && (
                                    <td>No users found.</td>
                                )}
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