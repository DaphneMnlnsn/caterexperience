import React, { useEffect, useState } from 'react';
import './Packages.css';
import AddPackageModal from '../components/AddPackageModal';
import EditPackageModal from '../components/EditPackageModal';
import AddThemeModal from '../components/AddThemeModal';
import EditThemeModal from '../components/EditThemeModal';
import AddAddonModal from '../components/AddAddonModal';
import EditAddonModal from '../components/EditAddonModal';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';
import { FaBell } from 'react-icons/fa';
import NotificationsDropdown from '../components/NotificationsDropdown';
import axiosClient from '../axiosClient';

function Packages() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [showEditPackageModal, setShowEditPackageModal] = useState(false);
  const [showAddThemeModal, setShowAddThemeModal] = useState(false);
  const [showEditThemeModal, setShowEditThemeModal] = useState(false);
  const [showAddAddonModal, setShowAddAddonModal] = useState(false);
  const [showEditAddonModal, setShowEditAddonModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [packages, setPackages] = useState([]);
  const [themes, setThemes] = useState([]);
  const [addons, setAddons] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedAddon, setSelectedAddon] = useState(null);

  useEffect(() => {
    fetchPackages();
    fetchThemes();
    fetchAddons();
  }, []);

  const fetchPackages = () => {
    axiosClient.get('/packages')
      .then(res => setPackages(res.data.packages))
      .catch(err => Swal.fire('Error', 'Could not load packages.', 'error'));
  };

  const fetchThemes = () => {
    axiosClient.get('/themes')
      .then(res => setThemes(res.data.themes))
      .catch(err => Swal.fire('Error', 'Could not load themes.', 'error'));
  };

  const fetchAddons = () => {
    axiosClient.get('/addons')
      .then(res => setAddons(res.data.addons))
      .catch(err => Swal.fire('Error', 'Could not load addons.', 'error'));
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.package_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredThemes = themes.filter(theme =>
    theme.theme_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAddons = addons.filter(addon =>
    addon.addon_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = user && user.role?.toLowerCase() === 'admin';

  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left" />
          <div className="topbar-right">
            <span className="user-name">
              {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
            </span>
            <NotificationsDropdown />
          </div>
        </header>

        <section className="page-header">
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
                    {isAdmin && (
                      <div className="button-group">
                          <button className="add-btn" onClick={() => setShowAddPackageModal(true)}>+ Add New Package</button>
                      </div>
                    )}
                </div>
                <div className="packages-grid">
                    {filteredPackages.map(pkg => (
                      <div 
                        key={pkg.package_id} 
                        className={`small-text-card card-yellow ${pkg.package_status === 'archived' ? 'archived' : ''}`}
                        onClick={() => {
                          if (isAdmin) {
                            setSelectedPackage(pkg);
                            setShowEditPackageModal(true);
                          }
                        }}
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
                    {isAdmin && (
                      <div className="button-group">
                          <button className="add-btn" onClick={() => setShowAddThemeModal(true)}>+ Add New Theme</button>
                      </div>
                    )}
                </div>
                <div className="packages-grid">
                    {filteredThemes.map(theme => (
                      <div 
                      key={theme.theme_id} 
                      className={`theme-card ${theme.theme_status === 'archived' ? 'archived' : ''}`}
                      onClick={() => {
                        if (isAdmin) {
                          setSelectedTheme(theme);
                          setShowEditThemeModal(true);
                        }
                      }}
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
                    {isAdmin && (
                      <div className="button-group">
                          <button className="add-btn" onClick={() => setShowAddAddonModal(true)}>+ Add New Addon</button>
                      </div>
                    )}
                </div>
                <div className="packages-grid">
                  {filteredAddons.map(addon => (
                    <div 
                    key={addon.addon_id} 
                    className={`addon-card card-yellow ${addon.addon_status === 'archived' ? 'archived' : ''}`}
                    onClick={() => {
                      if (isAdmin) {
                        setSelectedAddon(addon);
                        setShowEditAddonModal(true);
                      }
                    }}
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
      {isAdmin && ( <AddPackageModal show={showAddPackageModal} onClose={() => setShowAddPackageModal(false)} onSave={fetchPackages} />)}
      {isAdmin && (
        <EditPackageModal
          show={showEditPackageModal}
          onClose={() => {
            setShowEditPackageModal(false);
            setSelectedPackage(null);
          }}
          onSave={fetchPackages}
          pkg={selectedPackage}
        />
      )}
      {isAdmin && (<AddThemeModal show={showAddThemeModal} onClose={() => setShowAddThemeModal(false)} onSave={fetchThemes} />)}
      {isAdmin && (
        <EditThemeModal 
          show={showEditThemeModal} 
          onClose={() => {
            setShowEditThemeModal(false);
            setSelectedTheme(null);
          }} 
          onSave={fetchThemes}
          theme={selectedTheme}
        />
      )}
      {isAdmin && (<AddAddonModal show={showAddAddonModal} onClose={() => setShowAddAddonModal(false)} onSave={fetchAddons} />)}
      {isAdmin && (
        <EditAddonModal 
          show={showEditAddonModal} 
          onClose={() => {
            setShowEditAddonModal(false);
            setSelectedAddon(null);
          }}
          onSave={fetchAddons} 
          addon={selectedAddon}
        />
      )}
    </div>
  );
}

export default Packages;
