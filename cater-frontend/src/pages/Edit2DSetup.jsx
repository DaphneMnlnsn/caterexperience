import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import logo from '../assets/logo.png';
import './Edit2DSetup.css';

function Edit2DSetup() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [selectedLayout, setSelectedLayout] = useState('Birthday (200 pax)');

  return (
    <div className="page-container setup-page-container">
      <aside className="sidebar setup-sidebar">
        <img src={logo} alt="Ollinati Catering Logo" className="sidebar-logo" />

        <div className="table-guide">
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

        <div className="canvas-container">
          <div className="venue-layout-placeholder">
            <p>Venue layout will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Edit2DSetup;
