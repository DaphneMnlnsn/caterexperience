import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';
import './ClientDetails.css';
import axiosClient from '../../axiosClient';
import Header from '../../components/Header';

function ClientDetails() {

  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [editedClient, setEditedClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isArchived = client?.archived === 1 || client?.archived === true;

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

  const handleArchiveClient = () => {
    Swal.fire({
      title: 'Archive Client Record?',
      text: `This will hide ${client.customer_firstname} ${client.customer_lastname} from active lists.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, archive it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.put(`/customers/${id}/archive`)
        .then(() => {
          Swal.fire('Archived!', 'Client has been archived.', 'success');
          navigate('/admin/clients');
        })
        .catch(err => {
          console.error('Archive error:', err.response?.data || err.message);
          Swal.fire('Error', 'Could not archive client.', 'error');
        });
      }
    });
  };

  const handleRestoreClient = () => {
    Swal.fire({
      title: 'Restore Client Record?',
      text: `This will return ${client.customer_firstname} ${client.customer_lastname} to the active client list.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#2ecc71',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.put(`/customers/${id}/restore`)
          .then(() => {
            Swal.fire('Restored!', 'Client has been restored.', 'success');
            navigate('/admin/clients');
          })
          .catch(err => {
            console.error('Restore error:', err.response?.data || err.message);
            Swal.fire('Error', 'Could not restore client.', 'error');
          });
      }
    });
  };

  const handleResetPass = () => {
    Swal.fire({
      title: 'Reset Client Password?',
      text: `This will reset ${client.customer_firstname} ${client.customer_lastname}'s password. Please make sure to inform them of the change.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#2ecc71',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, reset it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.put(`/customers/${id}/reset`)
          .then(() => {
            Swal.fire('Reset!', 'Client password has been reset.', 'success');
            navigate('/admin/clients');
          })
          .catch(err => {
            console.error('Reset error:', err.response?.data || err.message);
            Swal.fire('Error', 'Could not reset client password.', 'error');
          });
      }
    });
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();

    const phoneDigits = editedClient.customer_phone.replace('+639', '');

    if (phoneDigits.length < 9) {
      Swal.fire({
        title: 'Invalid Contact Number',
        text: 'Contact number must have 9 digits after +639.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

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
        <Header user={user} />

        <section className="client-section white-bg">
          <div className="section-title">
            <h3>Client Details</h3>
            {!isEditing && !isArchived && (
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

                <label className='phone-editing'>Contact Number:
                  <div className="phone-input-details">
                    <span className="phone-prefix-details">+639</span>
                    <input
                      type="text"
                      placeholder="xxxxxxxxx"
                      value={editedClient.customer_phone.replace('+639', '')}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                        setEditedClient({
                          ...editedClient,
                          customer_phone: `+639${digits}`,
                        });
                      }}
                      required
                    />
                  </div>
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
            <button className="reset-btn" onClick={() => handleResetPass()}>Reset Password</button>
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
                      <td><button className="view-btn" onClick={() => navigate(`/bookings/${event.booking_id}`)}>View Booking</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ padding: '1rem', color: '#777' }}>No bookings found for this client.</p>
          )}

          <div className="delete-section">
            {isArchived ? (
              <button className="edit-btn" onClick={handleRestoreClient}>Restore Client Record</button>
            ) : (
              <button className="delete-btn" onClick={handleArchiveClient}>Archive Client Record</button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ClientDetails;
