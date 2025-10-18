import React, { useState, useEffect } from 'react';
import LandingNavbar from '../components/LandingNavbar';
import { FaFacebook, FaPhone, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import './LandingPage';
import axiosClient from '../axiosClient';
import Swal from 'sweetalert2';

function LandingMenu() {
  const [searchTerm, setSearchTerm] = useState('');
  const [menuData, setMenuData] = useState([]);
  const [halalFilter, setHalalFilter] = useState('');

  useEffect(() => {
    fetchFoods();
  }, []);

    const fetchFoods = () => {
        axiosClient.get('/foods')
            .then(res => {
                const foods = res.data.foods;

                const grouped = foods.reduce((acc, food) => {
                    const category = food.food_type;
                    if (!acc[category]) acc[category] = [];
                    acc[category].push({
                    name: food.food_name,
                    description: food.food_description,
                    id: food.food_id,
                    is_halal: food.is_halal,
                    food_status: food.food_status,
                    food_image_url: food.food_image_url,
                    food_type: food.food_type
                    });
                    return acc;
                }, {});

                const formatted = Object.entries(grouped).map(([category, items]) => ({
                    category,
                    items
                }));

                setMenuData(formatted);
            })
            .catch(err => {
                console.error('Failed to load foods:', err.response?.data || err.message);
                Swal.fire('Error', 'Could not load menu.', 'error');
            });
    };

    const filteredMenuData = menuData
    .map(category => ({
        ...category,
        items: category.items.filter(item => {
        const matchesName = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.food_type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesHalal =
            halalFilter === '' ||
            (halalFilter === 'halal' && item.is_halal === true) ||
            (halalFilter === 'non-halal' && item.is_halal === false);
        return matchesName && matchesHalal;
        })
    }))
    .filter(category => category.items.length > 0);

  return (
    <>
      <LandingNavbar />
        <div className="main-content landing-page">

          <section className="page-header landing-header">
                    <h3>Menu</h3>
                    <div className="page-header-actions">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search food by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="spacer" />
                        <div className="button-group">
                            <select
                                value={halalFilter}
                                onChange={(e) => setHalalFilter(e.target.value)}
                                className="filter-input"
                            >
                                <option value="">All</option>
                                <option value="halal">Halal</option>
                                <option value="non-halal">Not Halal</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="page-bottom">
                    <div className="menu-categories">
                        {filteredMenuData.map(cat => (
                          <div key={cat.category} className="menu-category-block">
                            <h3 className="category-title">{cat.category}</h3>
                            <div className="menu-grid">
                              {cat.items.map(item => (
                                <div key={item.name} className="menu-card">
                                  {item.food_status !== 'available' && <div className="archive-overlay">Unavailable</div>}
                                  <div className="menu-card-content">
                                    {item.food_image_url ? (
                                        <img
                                            src={`${process.env.REACT_APP_BASE_URL}/${item.food_image_url}`}
                                            alt={item.name}
                                            className="menu-card-img"
                                        />
                                    ) : (
                                        <div className="menu-card-placeholder">No Image</div>
                                    )}
                                    <span className="menu-name">{item.name}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {filteredMenuData.length === 0 && (
                            <p className="no-results">No foods found.</p>
                        )}
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

export default LandingMenu;