import React, { useEffect, useState } from 'react';
import './LandingPage';
import axiosClient from '../axiosClient';
import LandingNavbar from '../components/LandingNavbar';
import { FaFacebook, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function Packages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [packages, setPackages] = useState([]);
  const [themes, setThemes] = useState([]);
  const [addons, setAddons] = useState([]);

  useEffect(() => {
    fetchPackages();
    fetchThemes();
    fetchAddons();
  }, []);

  const fetchPackages = () => {
    axiosClient.get('/packages')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.packages || []);
        setPackages(data);
      })
      .catch(() => setPackages([]));
  };

  const fetchThemes = () => {
    axiosClient.get('/themes')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.themes || []);
        setThemes(data);
      })
      .catch(() => setThemes([]));
  };

  const fetchAddons = () => {
    axiosClient.get('/addons')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.addons || []);
        setAddons(data);
      })
      .catch(() => setAddons([]));
  };

  const filteredPackages = packages.filter(pkg =>
    (pkg.package_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pkg.package_type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredThemes = themes.filter(theme =>
    (theme.theme_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAddons = addons.filter(addon =>
    (addon.addon_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    <LandingNavbar />
          <div className="main-content landing-page">
    
            <section className="page-header landing-header">
                <div className="page-header-actions">
              <h3>Packages, Themes, and Addons</h3>
                <div className='spacer'></div>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="🔍 Search package, addon, or theme by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </section>
    
            <section className="page-bottom">
              <div className="menu-categories">
                <div className="menu-category-block">
                    <div className="page-header-actions">
                        <h3 className="category-title">Packages</h3>
                        <div className="spacer" />
                    </div>
                    <div className="packages-grid">
                        {filteredPackages.map(pkg => (
                          <div 
                            key={pkg.package_id} 
                            className={`small-text-card card-yellow ${pkg.package_status === 'archived' ? 'archived' : ''}`}
                          >
                            {pkg.package_status === 'archived' && <div className="archive-overlay">Unavailable</div>}
                            <h3 className="card-title">{pkg.package_name}</h3>
                            <div className="package-card-content">
                              <div className="package-prices">
                                <b>Package Type: </b><span className="price-red">{pkg.package_type}</span>
                                <br /><br /><b>Prices:</b><br />
                                {pkg.price_tiers.map(tier => (
                                  <div key={tier.package_price_id}>
                                    {tier.price_label} – <span className="price-red">Php {tier.price_amount.toLocaleString()}</span><br />
                                  </div>
                                ))}
                              </div>
                              <div className="package-inclusions">
                                <b>Inclusions:</b>
                                <ul>
                                  {pkg.package_description
                                    ?.split('\n')
                                    .filter(line => line.trim() !== '')
                                    .map((line, index) => (
                                      <li key={index}>{line}</li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                        {filteredPackages.length === 0 && (
                          <p className="no-results">No packages found.</p>
                        )}
                    </div>
    
                    <div className="page-header-actions">
                        <h3 className="category-title other-title">Themes</h3>
                        <div className="spacer" />
                    </div>
                    <div className="packages-grid">
                        {filteredThemes.map(theme => (
                          <div 
                          key={theme.theme_id} 
                          className={`theme-card ${theme.theme_status === 'archived' ? 'archived' : ''}`}
                          >
                            {theme.theme_status === 'archived' && <div className="archive-overlay">Unavailable</div>}
                            <div className="menu-card-content">
                              <img src={`http://localhost:8000/storage/${theme.theme_image_url}`} alt={theme.theme_name} />
                              <div className="theme-name">{theme.theme_name}</div>
                            </div>
                          </div>
                        ))}
                        {filteredThemes.length === 0 && (
                          <p className="no-results">No themes found.</p>
                        )}
                    </div>
    
                    <div className="page-header-actions">
                        <h3 className="category-title other-title">Addons</h3>
                        <div className="spacer" />
                    </div>
                    <div className="packages-grid">
                      {filteredAddons.map(addon => (
                        <div 
                        key={addon.addon_id} 
                        className={`addon-card card-yellow ${addon.addon_status === 'archived' ? 'archived' : ''}`}
                        >
                          {addon.addon_status === 'archived' && <div className="archive-overlay">Unavailable</div>}
                          <h3 className="card-title">{addon.addon_name}</h3>
                          <div className="addon-details">
                            <b>Description:</b><br />
                            <span>{addon.addon_description || 'No description'}</span><br />
                          </div>
                          <div className="addon-details">
                            <b>Prices:</b><br />
                            {addon.prices.map(price => (
                              <div key={price.addon_price_id}>
                                {price.description} – <span className="price-red">Php {price.price.toLocaleString()}</span><br />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {filteredAddons.length === 0 && (
                        <p className="no-results">No addons found.</p>
                      )}
                    </div>
                </div>
              </div>
            </section>
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
    </>
  );
}

