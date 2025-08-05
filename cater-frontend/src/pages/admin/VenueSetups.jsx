import React, { useEffect, useState } from 'react';
import './VenueSetups.css';
import Sidebar from '../../components/Sidebar';
import Swal from 'sweetalert2';
import { FaBell } from 'react-icons/fa';
import axiosClient from '../../axiosClient';
import { useNavigate } from 'react-router-dom';

function VenueSetups() {
    const mockSetups = [
  {
    setup_id: 1,
    client_name: 'Daphne Alwyn',
    event_type: 'Anniversary Celebration',
    event_schedule: 'April 21, 2025 9:00AM-2:00PM',
    design_status: 'Pending Design',
    venue_name: 'Ron Pavilion - Banquet Room',
    theme: 'Garden Fairy Theme',
  },
  {
    setup_id: 2,
    client_name: 'Marco Rivera',
    event_type: 'Wedding Reception',
    event_schedule: 'May 10, 2025 3:00PM-8:00PM',
    design_status: 'Completed',
    venue_name: 'Bella Casa Garden',
    theme: 'Rustic Romantic',
  },
  {
    setup_id: 3,
    client_name: 'Aira Mendez',
    event_type: 'Debut',
    event_schedule: 'June 2, 2025 5:00PM-10:00PM',
    design_status: 'Pending Design',
    venue_name: 'The Grand Ballroom',
    theme: 'Enchanted Forest',
  },
];

  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [setups, setSetups] = useState([]);
  const [selectedSetup, setSelectedSetup] = useState(null);

  useEffect(() => {
    fetchSetups();
  }, []);

  const fetchSetups = () => {
    axiosClient.get('/setups')
      .then(res => setSetups(res.data.setups))
      .catch(err => Swal.fire('Error', 'Could not load venue setups.', 'error'));
  };

  const filteredSetups = setups.filter(setup =>
    setup.layout_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    setup.layout_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                {setups.map((setup) => (
                    <div key={setup.setup_id} className="venue-card">
                    <div className="venue-details">
                        <div className="venue-info">
                        <div className="venue-field">
                            <span className="field-label">Client:</span>
                            <span className="field-value"> {setup.client_name}</span>
                        </div>
                        <div className="venue-field">
                            <span className="field-label">Event Type:</span>
                            <span className="field-value"> {setup.event_type}</span>
                        </div>
                        <div className="venue-field">
                            <span className="field-label">Schedule:</span>
                            <span className="field-value"> {setup.event_schedule}</span>
                        </div>
                        <div className="venue-field">
                            <span className="field-label">Design Status: </span>
                            <span className={`status-badge ${setup.design_status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {setup.design_status}
                            </span>
                        </div>
                        <div className="venue-field">
                            <span className="field-label">Event Venue:</span>
                            <span className="field-value"> {setup.venue_name}</span>
                        </div>
                        <div className="venue-field">
                            <span className="field-label">Theme:</span>
                            <span className="field-value"> {setup.theme}</span>
                        </div>
                        </div>
                        <div className="venue-actions">
                        {setup.design_status != 'Completed' ? (
                            <button className="edit-2d-btn" onClick={() => navigate(`/edit`)}> {/*/${setup.setup_id}*/}
                                Edit 2D Design
                            </button>
                        ) : (
                            <button className="edit-2d-btn" onClick={() => navigate(`/edit`)}>
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
