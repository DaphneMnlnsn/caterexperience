import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosClient from '../axiosClient';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './ProfilePage.css';

function ProfilePage() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    password_confirmation: '',
  });
  const [accountType, setAccountType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = user.role;
    setAccountType(role);

    const endpoint = role === 'client' ? '/customer/profile' : '/user/profile';

    axiosClient.get(endpoint)
      .then(({ data }) => {
        const normalized = role === 'client'
          ? {
              first_name: data.customer_firstname,
              middle_name: data.customer_middlename || '',
              last_name: data.customer_lastname,
              email: data.customer_email,
              phone: data.customer_phone || '',
              address: data.customer_address || '',
            }
          : {
              first_name: data.first_name,
              middle_name: data.middle_name || '',
              last_name: data.last_name,
              email: data.email,
              phone: data.user_phone || '',
              address: data.address || '',
            };
        setFormData((prev) => ({ ...prev, ...normalized }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    const endpoint = accountType === 'client' ? '/customer/profile' : '/user/profile';

    const payload = accountType === 'client'
      ? { customer_firstname: formData.first_name,
          customer_middlename: formData.middle_name,
          customer_lastname: formData.last_name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          ...(formData.password
              ? { customer_password: formData.password, customer_password_confirmation: formData.password_confirmation }
              : {}) }
      : { ...formData, user_phone: formData.phone };

    axiosClient.put(endpoint, payload)
      .then(({ data }) => {
        Swal.fire('Success', data.message || 'Profile updated successfully', 'success');
        setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
      })
      .catch((err) => {
        const errors = err.response?.data?.errors;
        Swal.fire('Error', errors ? Object.values(errors).join('\n') : 'Something went wrong', 'error');
      });
  };

  if (loading) return <div className="main-content">Loading...</div>;

  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content scrollable">
        <Header user={user} />

        <div className="profile-page">
          <div className="profile-header">
            <div className="avatar">
              {formData.first_name[0] || 'U'}
            </div>
            <div className="profile-info">
              <h2>{formData.first_name} {formData.middle_name} {formData.last_name}</h2>
              <p>{formData.email}</p>
            </div>
          </div>

          <div className="profile-sections">
            <section className="profile-section">
              <h3>Personal Details</h3>
              <form className="profile-form" onSubmit={handleSaveChanges}>
                <div className="form-group">
                  <label>First Name</label>
                  <input name="first_name" value={formData.first_name} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Middle Name</label>
                  <input name="middle_name" value={formData.middle_name} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input name="last_name" value={formData.last_name} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <div className="phone-input">
                    <input
                      type="tel"
                      inputMode="tel"
                      value={formData.phone}
                      onChange={e => {
                        let value = e.target.value;
                        if (value.trim() === '') {
                          setFormData({ ...formData, phone: '+63' });
                          return;
                        }
                        value = value.replace(/[^\d+]/g, '');
                        value = value.replace(/(?!^)\+/g, '');
                        const digitsOnly = value.startsWith('+') ? value.slice(1) : value;
                        if (digitsOnly.length > 15) {
                          value = (value.startsWith('+') ? '+' : '') + digitsOnly.slice(0, 15);
                        }
                        setFormData({ ...formData, phone: value });
                      }}
                      placeholder="+63xxxxxxxxxx"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input name="address" value={formData.address} onChange={handleChange} />
                </div>

                <hr />

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    name="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                  />
                </div>

                <button type="submit" className="user-save-btn">Save Changes</button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;