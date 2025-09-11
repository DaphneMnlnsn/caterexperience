import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import Header from '../components/Header';
import logo from '../assets/logo.png';
import './Edit2DSetup.css';
import VenueCanvas from '../components/VenueCanvas';
import ObjectPalette from '../components/ObjectPalette';
import axiosClient from '../axiosClient';

function Edit2DSetup() {
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

  const [selectedLayout, setSelectedLayout] = useState(null);
  const [setupId, setSetupId] = useState(null);
  const [templates, setTemplates] = useState(null);
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

      axiosClient.get(`/templates`)
      .then((res) => {
        const filtered = res.data.templates.filter(t => t.layout_type === venue);
        setTemplates(filtered);
      })
      .catch((err) => {
        console.error('Error fetching templates:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
      axiosClient.get(`/templates`)
      .then((res) => {
        const filtered = res.data.templates.filter(t => t.layout_type === venue);
        setTemplates(filtered);
      })
      .catch((err) => {
        console.error('Error fetching templates:', err);
      })
      .finally(() => setLoading(false));
  }, [venue]);

  const handleChange = (e) => {
    setSelectedLayout(e.target.value);
  }

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
          <ObjectPalette />
        </div>
        <div className="layout-select-container">
          <h3 className="layout-select-title">Use Predefined Layouts</h3>
          <select name="template" className='layout-dropdown' onChange={handleChange}>
            <option value="">Select Predefined Layout</option>
            {templates?.map(template => (
              <option key={template.template_id} value={template.template_id}>
                {template.template_name}
              </option>
            ))}
          </select>
          <div className="sidebar-buttons">
            <button className="setup-btn cancel-btn-small" onClick={() => navigate(-1)}>Back</button>
            <button
              className="setup-btn edit-btn"
              onClick={async () => {
                if (!canvasRef.current || !canvasRef.current.save) {
                  window.alert('Canvas not ready yet.');
                  return;
                }
                try {
                  await canvasRef.current.save();
                } catch (err) {
                }
              }}
            >Save</button>
          </div>
        </div>
      </aside>

      <div className="main-content edit-main-content">
        <Header user={user} />

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
          <VenueCanvas ref={canvasRef} setupId={setupId} templateId={selectedLayout} isClient={isClient} isWaiter={isWaiter}/>
        </div>
      </div>
    </div>
  );
}

export default Edit2DSetup;
