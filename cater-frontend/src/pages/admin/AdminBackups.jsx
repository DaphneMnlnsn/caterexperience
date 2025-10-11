import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import axiosClient from '../../axiosClient';
import Swal from 'sweetalert2';
import { FaDownload, FaTrash } from 'react-icons/fa';

function AdminBackups() {
    const [backups, setBackups] = useState([]);
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(atob(storedUser)) : null;

    const fetchBackups = () => {
        axiosClient.get('/backups')
            .then(res => setBackups(res.data.backups))
            .catch(err => console.error('Failed to fetch backups:', err.response?.data || err.message));
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleCreateBackup = () => {
        Swal.fire({
            title: 'Creating Backup...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        axiosClient.post('/backups/run')
            .then(() => {
                const checkBackups = (attempts = 0) => {
                    axiosClient.get('/backups')
                        .then(res => {
                            setBackups(res.data.backups);

                            if (attempts < 5 && (!res.data.backups.length || res.data.backups[0].createdAt < Date.now() - 5000)) {
                                setTimeout(() => checkBackups(attempts + 1), 2000);
                            } else {
                                Swal.close();
                                Swal.fire('Success!', 'Backup created successfully.', 'success');
                            }
                        })
                        .catch(err => {
                            Swal.close();
                            Swal.fire('Error', 'Failed to fetch backups.', 'error');
                            console.error(err);
                        });
                };

                checkBackups();
            })
            .catch(err => {
                Swal.close();
                Swal.fire('Error', 'Failed to create backup.', 'error');
                console.error(err);
            });
    };

    const handleDeleteBackup = (file) => {
        Swal.fire({
            title: 'Delete Backup?',
            text: `Are you sure you want to delete ${file}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if(result.isConfirmed){
                axiosClient.post('/backups/delete', { file })
                    .then(() => {
                        Swal.fire('Deleted!', 'Backup deleted successfully.', 'success');
                        fetchBackups();
                    })
                    .catch(err => {
                        Swal.fire('Error', 'Failed to delete backup.', 'error');
                        console.error(err);
                    });
            }
        });
    };

    const handleDownloadBackup = (file) => {
        window.open(`${process.env.REACT_APP_API_BASE_URL}/backups/download/${file}`, '_blank');
    };

    return (
        <div className="page-container">
            <Sidebar />
            <div className="main-content">
                <Header user={user} />
                <section className="page-header">
                    <h3>Backup Management</h3>
                    <button onClick={handleCreateBackup} className='backup-btn'>Create Backup</button>
                </section>
                <section className="page-bottom">
                    <table className="page-table">
                        <thead>
                            <tr>
                                <th>Backup File</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backups.length > 0 ? backups.map((backup, idx) => (
                                <tr key={idx}>
                                    <td>{backup}</td>
                                    <td className="actions">
                                        <FaDownload className="icon edit-icon" onClick={() => {
                                        handleDownloadBackup(backup)
                                        }}/>
                                        <FaTrash className="icon delete-icon" onClick={() => handleDeleteBackup(backup)} />
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="2">No backups found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
}

export default AdminBackups;