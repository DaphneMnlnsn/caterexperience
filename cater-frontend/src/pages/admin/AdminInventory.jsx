import React, { useEffect, useState } from 'react';
import './AdminUsers.css';
import AddItemModal from '../../components/AddItemModal';
import EditItemModal from '../../components/EditItemModal';
import Sidebar from '../../components/Sidebar';
import Swal from 'sweetalert2';
import { FaBell, FaArchive, FaPen, FaUndo } from 'react-icons/fa';
import axiosClient from '../../axiosClient';

function AdminInventory() {
    const [inventoryData, setInventoryData] = React.useState([]);
    const [showModal, setShowModal] = React.useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    useEffect(() => {
        fetchitems();
    }, []);

    const fetchitems = () => {
        axiosClient.get('/inventory')
        .then(res => {
            setInventoryData(res.data);
        })
        .catch(err => console.error('Failed to fetch items:', err.response?.data || err.message));
    }

    const filteredItems = inventoryData
    .filter(item => item.item_status === (showArchived ? 'archived' : 'available'))
    .filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleArchiveItem = (item) => {
        Swal.fire({
            title: 'Archive Item?',
            text: `This will hide the item from the list.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Yes, archive it!',
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient.put(`/inventory/${item.item_id}/archive`)
                .then(() => {
                    Swal.fire('Archived!', 'Item has been archived.', 'success');
                    fetchitems();
                })
                .catch(err => {
                    console.error('Archive error:', err.response?.data || err.message);
                    Swal.fire('Error', 'Could not archive item.', 'error');
                });
            }
        });
    }

    const handleRestoreItem = (item) => {
        Swal.fire({
            title: 'Restore Item?',
            text: `This will show the item on the list.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2ecc71',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Yes, restore it!',
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient.put(`/inventory/${item.item_id}/restore`)
                .then(() => {
                    Swal.fire('Restored!', 'Item has been restored.', 'success');
                    fetchitems();
                })
                .catch(err => {
                    console.error('Restore error:', err.response?.data || err.message);
                    Swal.fire('Error', 'Could not restore item.', 'error');
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
                    <h3>Inventory Tracking</h3>
                    <div className="page-header-actions">
                        <div className="search-box">
                            <input
                            type="text"
                            placeholder="🔍 Search items by name or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="spacer" />
                        <button
                        className="edit-btn"
                        onClick={() => setShowArchived(prev => !prev)}
                        >
                            {showArchived ? 'Show Available Items' : 'Show Archived Items'}
                        </button>
                        <div className="button-group">
                            <button className="add-btn" onClick={() => {setShowModal(true);}}>+ Add New Item</button>
                        </div>
                    </div>
                </section>

                <section className="page-bottom">
                    <div className="table-container">
                        <table className="page-table">
                            <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Current Qty.</th>
                                <th>Total Qty.</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.item_name}</td>
                                        <td>{item.item_type}</td>
                                        <td>{item.item_price}/{item.item_unit}</td>
                                        <td>{item.item_current_quantity}</td>
                                        <td>{item.item_quantity}</td>
                                        <td className="actions">
                                            {!showArchived ? (
                                                <>
                                                    <FaPen className="icon edit-icon" onClick={() => {
                                                        setSelectedItem(item);
                                                        setShowEditModal(true);
                                                    }}/>
                                                    <FaArchive className="icon delete-icon" onClick={() => handleArchiveItem(item)} />
                                                </>
                                            ) : (
                                                <FaUndo className="icon edit-icon" onClick={() => handleRestoreItem(item)} />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredItems.length === 0 && (
                                    <td>No items found.</td>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            <AddItemModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSave={fetchitems}
            />
            <EditItemModal
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={fetchitems}
            item={selectedItem}
            />
        </div>
    );
}

export default AdminInventory ;