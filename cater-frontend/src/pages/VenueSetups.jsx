import React, { useEffect, useState } from 'react';
import './VenueSetups.css';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';
import { FaBell } from 'react-icons/fa';
import axiosClient from '../axiosClient';
import { useNavigate } from 'react-router-dom';

function VenueSetups() {
  const storedUser = localStorage.getItem('user');
const user = storedUser ? JSON.parse(atob(storedUser)) : null;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [setups, setSetups] = useState([]);
  const [selectedSetup, setSelectedSetup] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchSetups();
  }, []);

  const fetchSetups = () => {
    axiosClient.get('/setups')
      .then(res => setSetups(res.data.setups))
      .catch(err => Swal.fire('Error', 'Could not load venue setups.', 'error'));
  };

  const filteredSetups = setups
    .filter(setup => {
      if (filter === 'pending') {
        return setup.booking?.booking_status?.toLowerCase() === 'pending';
      }
      if (filter === 'finished') {
        return setup.booking?.booking_status?.toLowerCase() === 'finished';
      }
      return true;
    })
    .filter(setup =>
      setup.layout_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setup.layout_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleSubmit = (setup) => {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to submit this layout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, submit it!',
    }).then((result) => {
        if (result.isConfirmed) {
        axiosClient.put(`/setups/submit/${setup}`)
        .then((res) => {
            Swal.fire('Submitted!', 'Layout can now be reviewed by client.', 'success');
            fetchSetups();
        })
        .catch((err) => {
            console.error(err);
            Swal.fire('Error', 'Failed to submit.', 'error');
        });
        }
    });
  }

  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left" />
          <div className="topbar-right">
            <span className="user-name">
              {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
            </span>
            <FaBell className="notif-icon" />
          </div>
        </header>

        <section className="page-header">
            <div className="page-header-actions">
          <h3>Venue Setups</h3>
            <div className='spacer'></div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className='filter-input'>
              <option value="pending">Pending Bookings</option>
              <option value="finished">Finished Bookings</option>
              <option value="all">All</option>
            </select>
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search setup by event name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="page-bottom">
            <div className="venue-grid">
                {filteredSetups.map((setup) => (
                    <div key={setup.setup_id} className="venue-card">
                    <div className="venue-details">
                        <div className="venue-info">
                          <div className="venue-field">
                              <span className="field-label">Layout Name:</span>
                              <span className="field-value"> {setup.layout_name}</span>
                          </div>
                          <div className="venue-field">
                              <span className="field-label">Client:</span>
                              <span className="field-value"> {setup.booking.customer.customer_firstname + " " + setup.booking.customer.customer_lastname}</span>
                          </div>
                          <div className="venue-field">
                              <span className="field-label">Event Type:</span>
                              <span className="field-value"> {setup.booking.event_type}</span>
                          </div>
                          <div className="venue-field">
                              <span className="field-label">Schedule:</span>
                              <span className="field-value"> {setup.booking.event_date + " " + setup.booking.event_start_time + "-" + setup.booking.event_end_time}</span>
                          </div>
                          <div className="venue-field">
                              <span className="field-label">Design Status: </span>
                              <span 
                                className={`status-badge ${setup.status ? setup.status.toLowerCase().replace(/\s+/g, '-') : ''}`}
                              >
                                {setup.status || 'Unknown'}
                              </span>
                          </div>
                          <div className="venue-field">
                              <span className="field-label">Event Venue:</span>
                              <span className="field-value"> {setup.booking.event_location}</span>
                          </div>
                          <div className="venue-field">
                              <span className="field-label">Theme:</span>
                              <span className="field-value"> {setup.booking.theme?.theme_name || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="venue-actions">
                        {setup.status != 'approved' && setup.status != 'submitted' ? (
                          <>
                            <button className="edit-2d-btn" onClick={() => navigate(`/edit/${setup.booking_id}`)}>
                                Edit 2D Design
                            </button>
                            <button className="edit-2d-btn submit-client" onClick={() => handleSubmit(setup.setup_id)}>
                                Submit to Client
                            </button>
                          </>
                        ) : (
                            <button className="edit-2d-btn" onClick={() => navigate(`/view/${setup.booking_id}`)}>
                                View 2D Design
                            </button>
                        )}
                        </div>
                    </div>
                    </div>
                ))}
                {setups.length === 0 && <p className="no-results">No setups found.</p>}
            </div>
        </section>
      </div>
    </div>
  );
}

export default VenueSetups;
