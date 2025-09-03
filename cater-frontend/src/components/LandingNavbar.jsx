import React from 'react';
import './LandingNavbar.css';
import logo from '../assets/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';

function LandingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar landing-nav">
      <img src={logo} alt="Ollinati Catering" className="logo-landing" />
      <ul className="nav-links">
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
      <button className="login-button" onClick={() => navigate('/login')}>
        Login
      </button>
    </nav>
  );
}

export default LandingNavbar;