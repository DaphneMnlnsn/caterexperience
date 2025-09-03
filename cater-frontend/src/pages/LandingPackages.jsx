import React, { useEffect, useState } from 'react';
import './LandingPackages.css';
import axiosClient from '../axiosClient';
import LandingNavbar from '../components/LandingNavbar';

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

  const placeholderPackages = [
    { package_id: 'p1', package_name: 'Platinum Debut/ Birthday Package', package_type: 'Event', price_tiers: [ { price_label: '50pax', price_amount: 18000 }, { price_label: '100pax', price_amount: 18000 } ], package_description: 'Choice of Main Menu with Desserts and Softdrinks\nUniformed Waiters\nStandard set up for stage' },
    { package_id: 'p2', package_name: 'VIP Wedding Package', package_type: 'Event', price_tiers: [ { price_label: '150pax', price_amount: 94600 }, { price_label: '200pax', price_amount: 112600 } ], package_description: 'Choice of Main Menu with Desserts and Softdrinks\nFlower arrangement for entourage and venue' },
    { package_id: 'p3', package_name: 'VIP Birthday Package', package_type: 'Event', price_tiers: [ { price_label: '70pax', price_amount: 18000 }, { price_label: '80pax', price_amount: 18000 } ], package_description: 'Basic Lights & Sound System\nPhotobooth (2 hours)' },
    { package_id: 'p4', package_name: 'Basic Package', package_type: 'Event', price_tiers: [ { price_label: '50pax', price_amount: 18000 } ], package_description: 'Choice of Main Menu\nWith Uniformed Waiters' },
  ];

  const placeholderThemes = [
    { theme_id: 't1', theme_name: 'Slam Dunk Theme' },
    { theme_id: 't2', theme_name: 'Classic Elegance' },
    { theme_id: 't3', theme_name: 'Deadpool Theme' },
  ];

  const placeholderAddons = [
    { addon_id: 'a1', addon_name: 'Tisoy’s Ice Cream', addon_description: '', prices: [ { description: '3 Gallons (1 Flavor, 100 cups)', price: 3000 } ] },
    { addon_id: 'a2', addon_name: 'Heart Cafe - Soda Pop', addon_description: '', prices: [ { description: '3 Gallons (1 Flavor, 100 cups)', price: 3000 } ] },
    { addon_id: 'a3', addon_name: 'Kiel’s Foodcart', addon_description: '', prices: [ { description: '3 Gallons (1 Flavor, 100 cups)', price: 3000 } ] },
  ];

  return (
    <>
    <LandingNavbar />
    <div className="page-container packages-page menu-white">
      <div className="main-content">
        <section className="page-header">
          <div className="page-header-actions" style={{ justifyContent: 'space-between', padding: '0 24px' }}>
            <h3 className="packages-title">Packages</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search package, addon, or theme by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="page-bottom">
          <div className="menu-categories">
            <div className="menu-category-block">
              <h3 className="category-title">Event Packages</h3>
              <div className="packages-grid">
                {(filteredPackages.length ? filteredPackages : placeholderPackages).map(pkg => (
                  <div key={pkg.package_id} className={`small-text-card card-yellow ${pkg.package_status === 'archived' ? 'archived' : ''}`}>
                    <h3 className="card-title">{pkg.package_name}</h3>
                    <div className="package-card-content">
                      <div className="package-prices">
                        <b>Package Type: </b><span className="price-red">{pkg.package_type}</span>
                        <br /><br /><b>Prices:</b><br />
                        {(pkg.price_tiers || []).map(tier => (
                          <div key={tier.package_price_id || tier.price_label}>
                            {tier.price_label} – <span className="price-red">Php {(tier.price_amount || 0).toLocaleString()}</span><br />
                          </div>
                        ))}
                      </div>
                      <div className="package-inclusions">
                        <b>Inclusions:</b>
                        <ul>
                          {(pkg.package_description || '')
                            .split('\n')
                            .filter(line => line.trim() !== '')
                            .map((line, index) => (
                              <li key={index}>{line}</li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
                
              </div>

              <h3 className="category-title other-title">Event Themes</h3>
              <div className="packages-grid">
                {(filteredThemes.length ? filteredThemes : placeholderThemes).map(theme => (
                  <div key={theme.theme_id} className={`theme-card ${theme.theme_status === 'archived' ? 'archived' : ''}`}>
                    <div className="theme-title">{theme.theme_name}</div>
                  </div>
                ))}
                
              </div>

              <h3 className="category-title other-title">Event Add-ons</h3>
              <div className="packages-grid">
                {(filteredAddons.length ? filteredAddons : placeholderAddons).map(addon => (
                  <div key={addon.addon_id} className={`addon-card card-yellow ${addon.addon_status === 'archived' ? 'archived' : ''}`}>
                    <h3 className="card-title">{addon.addon_name}</h3>
                    <div className="addon-details">
                      <b>Description:</b><br />
                      <span>{addon.addon_description || 'No description'}</span><br />
                    </div>
                    <div className="addon-details">
                      <b>Prices:</b><br />
                      {(addon.prices || []).map(price => (
                        <div key={price.addon_price_id || price.description}>
                          {price.description} – <span className="price-red">Php {(price.price || 0).toLocaleString()}</span><br />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
              </div>
            </div>
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

