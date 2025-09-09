import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import logo from '../assets/logo.png';
import './Edit2DSetup.css';
import VenueCanvas from '../components/VenueCanvas';
import axiosClient from '../axiosClient';
import NotificationsDropdown from '../components/NotificationsDropdown';

function View2DSetup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;
  const canvasRef = useRef(null);

  const hasRole = (roles) => {
    if (!user?.role) return false;
    const current = String(user.role).toLowerCase();
    if (Array.isArray(roles)) {
      return roles.some(r => String(r).toLowerCase() === current);
    }
    return String(roles).toLowerCase() === current;
  };

  const isClient = hasRole('client');
  const isWaiter = hasRole('head waiter');

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
    return <div>No setup found for this booking or Unauthorized.</div>;
  }

  return (
    <div className="page-container setup-page-container">
      <aside className="sidebar setup-sidebar">
        <img src={logo} alt="Logo" className="sidebar-logo" />
        <div className="layout-select-container">
          <div className="sidebar-buttons">
            <button className="setup-btn cancel-btn-small" onClick={() => navigate(-1)}>Back</button>
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
            <NotificationsDropdown />
          </div>
        </header>

        <div className="canvas-container">
          <VenueCanvas ref={canvasRef} setupId={setupId} isClient={isClient} isWaiter={isWaiter} />
        </div>
      </div>
    </div>
  );
}

export default View2DSetup;
