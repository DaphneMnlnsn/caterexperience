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
        <li>Home</li>
        <li>Menu</li>
        <li>Packages</li>
      </ul>
      <button className="login-button" onClick={() => navigate('/')}>Login</button>
    </nav>
  );
}

export default LandingNavbar;