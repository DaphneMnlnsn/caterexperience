import React, {useState} from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import './LandingPage.css';
import { FaFacebook, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import axiosClient from '../axiosClient';

function LandingPage() {
  const navigate = useNavigate();
  const [eventCode, setEventCode] = useState('');

  const handleView = async () => {
    if (!eventCode.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Event Number',
        text: 'Please enter your event number before proceeding.',
      });
      return;
    }

    try {
      const res = await axiosClient.get(`/bookings/code/${eventCode}`);
      if (res.data.booking) {
        navigate(`/public/booking/${res.data.booking.booking_id}`);
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Event Not Found',
        text: 'We could not find any booking with that event number. Please check and try again.',
      });
    }
  };

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
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                />
                <button className="view-btn" onClick={() => handleView()}>View</button>
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
                    <FaFacebook />
                  </span>
                  <span>Ron Pavilion - Home of Ollinati Catering</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">
                    <FaPhone />
                  </span>
                  <span>093328239434</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">
                    <FaMapMarkerAlt />
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
            Copyright © 2025. All Rights Reserved | CaterXperience
          </div>
        </footer>
      </main>
    </div>
  );
}

export default LandingPage;