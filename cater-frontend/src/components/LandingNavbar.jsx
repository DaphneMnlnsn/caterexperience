import React, { use } from 'react';
import './LandingNavbar.css';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

function LandingNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar landing-nav">
      <img src={logo} alt="Ollinati Catering" className="logo-landing" />
      <ul className="nav-links">
        <li onClick={() => navigate('/')}>Home</li>
        <li onClick={() => navigate('/landing/menu')}>Menu</li>
        <li onClick={() => navigate('/landing/packages')}>Packages</li>
      </ul>
      <button className="login-button" onClick={() => navigate('/login')}>Login</button>
    </nav>
  );
}

export default LandingNavbar;