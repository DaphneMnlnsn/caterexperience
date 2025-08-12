import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import logo from '../assets/logo.png';
import './Edit2DSetup.css';
import VenueCanvas from '../components/VenueCanvas';
import ObjectPalette from '../components/ObjectPalette';
import axiosClient from '../axiosClient';

function Edit2DSetup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [selectedLayout, setSelectedLayout] = useState('Birthday (200 pax)');
  const [setupId, setSetupId] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    axiosClient.get(`/setups/${id}`)
      .then((res) => {
        const setup = res.data;
        if (setup.setup_id) {
          setSetupId(setup.setup_id);
          setVenue(setup.layout_type);
        }
      })
      .catch((err) => {
        console.error('Error fetching setup:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div>Loading setup...</div>;
  }

  if (!setupId) {
    return <div>No setup found for this booking.</div>;
  }

  return (
    <div className="page-container setup-page-container">
      <aside className="sidebar setup-sidebar">
        <img src={logo} alt="Logo" className="sidebar-logo" />
        <div className="palette-scroll">
          <ObjectPalette onSelect={(type) => console.log('Selected:', type)} />
        </div>
        <div className="layout-select-container">
          <h3 className="layout-select-title">Use Predefined Layouts</h3>
          <select
            value={selectedLayout}
            onChange={(e) => setSelectedLayout(e.target.value)}
            className="layout-dropdown"
          >
            <option value="Birthday (200 pax)">Birthday (200 pax)</option>
            <option value="Wedding (150 pax)">Wedding (150 pax)</option>
            <option value="Corporate (100 pax)">Corporate (100 pax)</option>
            <option value="Anniversary (80 pax)">Anniversary (80 pax)</option>
          </select>
          <div className="sidebar-buttons">
            <button className="setup-btn cancel-btn-small" onClick={() => navigate(-1)}>Back</button>
            <button className="setup-btn edit-btn">Save</button>
          </div>
        </div>
      </aside>

      <div className="main-content edit-main-content">
        <header className="topbar">
          <div />
          <div className="topbar-right">
            <span className="user-name">
              {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
            </span>
            <FaBell className="notif-icon" />
          </div>
        </header>

        <select
          value={venue}
          className="layout-dropdown"
          disabled
        >
          <option value="Pavilion">Pavilion</option>
          <option value="Poolside">Poolside</option>
          <option value="Airconditioned Room">Airconditioned Room</option>
          <option value="Custom Venue">Outside Venue</option>
        </select>

        <div className="canvas-container">
          <VenueCanvas setupId={setupId} />
        </div>
      </div>
    </div>
  );
}

export default Edit2DSetup;
