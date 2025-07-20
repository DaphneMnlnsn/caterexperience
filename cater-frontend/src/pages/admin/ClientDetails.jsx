import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';
import './ClientDetails.css';
import { FaBell } from 'react-icons/fa';
import axiosClient from '../../axiosClient';

function ClientDetails() {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [editedClient, setEditedClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosClient.get(`/customers/${id}`)
    .then(res => {
      setClient(res.data.customer);
      setLoading(false);
    })
    .catch(err => {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    });
  }, [id]);

  const handleDeleteClient = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete ${client.customer_firstname} ${client.customer_lastname}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.delete(`/customers/${id}`)
        .then(() => {
          Swal.fire('Deleted!', 'Client has been deleted.', 'success');
          navigate('/admin/clients');
        })
        .catch(err => {
          console.error('Delete error:', err.response?.data || err.message);
          Swal.fire('Error', 'Could not delete client.', 'error');
        });
      }
    });
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();

    axiosClient.put(`/customers/${id}`, editedClient)
    .then(res => {
      setClient(res.data.customer);
      setIsEditing(false);
      Swal.fire('Updated!', 'Client details have been saved.', 'success');
    })
    .catch(err => {
      console.error('Update error:', err.response?.data || err.message);
      Swal.fire('Error', 'Could not update client.', 'error');
    });
  };

  if (loading) return <div className="main-content">Loading...</div>;
  if (error) return <div className="main-content">Error: {error}</div>;
  if (!client) return <div className="main-content">No client data available.</div>;

  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content scrollable">
        <header className="topbar">
          <div></div>
          <div className="topbar-right">
            <span className="user-name">
              {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
            </span>
            <FaBell className="notif-icon" />
          </div>
        </header>

        <section className="client-section white-bg">
          <div className="section-title">
            <h3>Client Details</h3>
            {!isEditing && (
              <button
                className="booking-edit-btn"
                onClick={() => {
                  setEditedClient({ ...client });
                  setIsEditing(true);
                }}
              >
                Edit Details
              </button>
            )}
          </div>

          {isEditing ? (
            <form className="edit-form" onSubmit={handleSaveChanges}>
              <div className="form-grid">
                <label>First Name:
                  <input
                    type="text"
                    value={editedClient.customer_firstname}
                    onChange={e =>
                      setEditedClient({ ...editedClient, customer_firstname: e.target.value })
                    }
                    required
                  />
                </label>

                <label>Middle Name:
                  <input
                    type="text"
                    value={editedClient.customer_middlename}
                    onChange={e =>
                      setEditedClient({ ...editedClient, customer_middlename: e.target.value })
                    }
                  />
                </label>

                <label>Last Name:
                  <input
                    type="text"
                    value={editedClient.customer_lastname}
                    onChange={e =>
                      setEditedClient({ ...editedClient, customer_lastname: e.target.value })
                    }
                    required
                  />
                </label>

                <label>Contact Number:
                  <input
                    type="text"
                    value={editedClient.customer_phone}
                    onChange={e =>
                      setEditedClient({ ...editedClient, customer_phone: e.target.value })
                    }
                    required
                  />
                </label>

                <label>Address:
                  <input
                    type="text"
                    value={editedClient.customer_address}
                    onChange={e =>
                      setEditedClient({ ...editedClient, customer_address: e.target.value })
                    }
                    required
                  />
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn-small">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn-small">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="info-grid">
              <p><strong>Client Name:</strong> {client.customer_firstname} {client.customer_middlename} {client.customer_lastname}</p>
              <p><strong>Client Contact Number:</strong> {client.customer_phone}</p>
              <p><strong>Client Address:</strong> {client.customer_address}</p>
            </div>
          )}
        </section>

        <section className="client-section gray-bg">
          <h3>Client Account Credentials</h3>
          <div className="credentials-row">
            <p><strong>Email Address:</strong> {client.customer_email}</p>
            <button className="reset-btn">Reset Password</button>
          </div>
        </section>

        <section className="client-section white-bg">
          <h3 className="section-title">
            Booking History
            <span className="total-bookings">
              {client.bookings && client.bookings.length > 0
                ? `Total Bookings: ${client.bookings.length}`
                : 'No Bookings Found'}
            </span>
          </h3>

          {client.bookings && client.bookings.length > 0 ? (
            <div className="booking-table-wrapper">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Event Date</th>
                    <th>Event Type</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {client.bookings.map((event, index) => (
                    <tr key={index}>
                      <td>{event.event_name}</td>
                      <td>{event.event_date || 'TBD'}</td>
                      <td>{event.event_type}</td>
                      <td>{event.booking_status}</td>
                      <td><button className="view-btn">View Booking</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ padding: '1rem', color: '#777' }}>No bookings found for this client.</p>
          )}

          <div className="delete-section">
            <button className="delete-btn" onClick={handleDeleteClient}>Delete Client Record</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ClientDetails;
