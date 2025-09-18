import React, { useState } from 'react';
import './LandingNavbar.css';
import logo from '../assets/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

function LandingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar landing-nav">
      <img src={logo} alt="Ollinati Catering" className="logo-landing" />

      <div className="hamburger-menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      <ul className="nav-links desktop-only">
        <li
          className={isActive('/') ? 'active' : ''}
          onClick={() => navigate('/')}
        >
          Home
        </li>
        <li
          className={isActive('/landing/menu') ? 'active' : ''}
          onClick={() => navigate('/landing/menu')}
        >
          Menu
        </li>
        <li
          className={isActive('/landing/packages') ? 'active' : ''}
          onClick={() => navigate('/landing/packages')}
        >
          Packages
        </li>
      </ul>
      <button
        className="login-button desktop-only"
        onClick={() => navigate('/login')}
      >
        Login
      </button>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li
            className={isActive('/') ? 'active' : ''}
            onClick={() => { navigate('/'); setMenuOpen(false); }}
          >
            Home
          </li>
          <li
            className={isActive('/landing/menu') ? 'active' : ''}
            onClick={() => { navigate('/landing/menu'); setMenuOpen(false); }}
          >
            Menu
          </li>
          <li
            className={isActive('/landing/packages') ? 'active' : ''}
            onClick={() => { navigate('/landing/packages'); setMenuOpen(false); }}
          >
            Packages
          </li>
        </ul>
        <button
          className="login-button"
          onClick={() => { navigate('/login'); setMenuOpen(false); }}
        >
          Login
        </button>
      </div>
    </nav>
  );
}

export default LandingNavbar;
