import React, { useState } from 'react';
import LandingNavbar from '../components/LandingNavbar';
import './LandingMenu.css';

function LandingMenu() {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { name: 'Beef', items: ['', '', '', '', ''] },
    { name: 'Pork', items: ['', '', '', '', ''] },
    { name: 'Chicken', items: ['', '', '', '', ''] },
    { name: 'Vegetables', items: ['', '', '', '', ''] },
    { name: 'Pasta or Fish', items: ['', '', '', '', ''] },
    { name: 'Dessert', items: ['', '', '', '', ''] },
  ];

  const filtered = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(it => (it || '').toLowerCase().includes(searchTerm.toLowerCase()))
  }));

  return (
    <>
    <LandingNavbar />
    <div className="page-container menu-white">
      <div className="main-content">

        <section className="page-header">
          <div className="page-header-actions" style={{ justifyContent: 'space-between', padding: '0 24px' }}>
            <div className="menu-main-title">Menu</div>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search food by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="page-bottom">
          <div className="menu-categories">
            {filtered.map(cat => (
              <div key={cat.category} className="menu-category-block">
                <h3 className="category-title">{cat.name}</h3>
                <div className="menu-grid">
                  {cat.items.map((item, idx) => (
                    <div key={`${cat.name}-${idx}`} className="menu-card">
                      <div className="menu-card-content">
                        <span className="menu-name">{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="no-results">No foods found.</p>
            )}
          </div>
        </section>
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
    </>
  );
}

export default LandingMenu;