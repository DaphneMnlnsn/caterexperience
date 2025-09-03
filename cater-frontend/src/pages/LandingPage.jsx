import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <LandingNavbar />
      <main className="main-content home-root">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-overlay">
            <div className="hero-content">
              <h1>View your Event Details</h1>
              <div className="event-search">
                <input 
                  type="text" 
                  placeholder="Enter Event Number" 
                  className="event-input"
                />
                <button className="view-btn">View</button>
              </div>
            </div>
          </div>
        </div>

        {/* Free Four Hours Venue Section */}
        <div className="venue-section">
          <h2>Free Four Hours Venue if you Book</h2>
          <div className="venue-cards">
            <div className="landing-venue-card">
              <div className="venue-image pavilion"></div>
              <h3>Pavilion</h3>
            </div>
            <div className="landing-venue-card">
              <div className="venue-image banquet-room"></div>
              <h3>Banquet Room</h3>
            </div>
            <div className="landing-venue-card">
              <div className="venue-image poolside"></div>
              <h3>Poolside Area</h3>
            </div>
          </div>
        </div>

        {/* Catering Menu Section */}
        <div className="menu-section">
          <div className="menu-content">
            <div className="menu-text">
              <h2>Catering with a Variety of Menu Choices</h2>
              <p>
                Ollinati Catering offers several menu choices where you can choose your own menu for your event. 
                Choose between a variety of food for the categories of chicken, pork, beef, fish/pasta, vegetables, and dessert.
              </p>
              <button 
                className="menu-btn" 
                onClick={() => navigate('/landing/menu')}
              >
                View Menu Offers &gt;&gt;
              </button>
            </div>
            <div className="menu-icon">
              <div className="food-icon"></div>
            </div>
          </div>
        </div>

        {/* Package Offers Section */}
        <div className="package-section">
          <div className="package-content">
            <div className="package-icon">
              <div className="gift-icon"></div>
            </div>
            <div className="package-text">
              <h2>Choose from a Variety of Package Offers</h2>
              <p>
                Ollinati Catering offers several package choices where you can choose your own event type. 
                Choose between Basic packages, package with themes, and addons.
              </p>
              <button 
                className="package-btn" 
                onClick={() => navigate('/landing/packages')}
              >
                View Package Offers &gt;&gt;
              </button>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="footer-section">
          <div className="footer-content">
            <div className="footer-info">
              <h2>Walk-In Bookings Only!</h2>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">
                    <img src="/src/assets/Facebook.png" alt="Facebook" style={{width: '1.5rem', height: '1.5rem'}} />
                  </span>
                  <span>Ron Pavilion - Home of Ollinati Catering</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">
                    <img src="/src/assets/Phone.png" alt="Phone" style={{width: '1.5rem', height: '1.5rem'}} />
                  </span>
                  <span>093328239434</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">
                    <img src="/src/assets/Location.png" alt="Location" style={{width: '1.5rem', height: '1.5rem'}} />
                  </span>
                  <span>Bunsuran 1st 3014 Pandi, Philippines</span>
                </div>
              </div>
            </div>
            <div className="footer-logo">
              <div className="footer-logo-text"></div>
            </div>
          </div>
          <div className="copyright">
            Copyright © 2025. All Rights Reserved | CatXperience
          </div>
        </footer>
      </main>
    </div>
  );
}

export default LandingPage;