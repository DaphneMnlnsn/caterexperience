import React, {useEffect} from 'react';
import './AddUserModal.css';
import Swal from 'sweetalert2';
import axiosClient from '../axiosClient';

function EditUserModal({ show, onClose, onSave, user }) {

  const [formData, setFormData] = React.useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    role: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.user_phone || '',
        address: user.address || '',
        gender: user.gender || '',
        role: user.role || '',
      });
    }
  }, [user]);

  const handleResetPass = () => {
    Swal.fire({
      title: 'Reset User Password?',
      text: `This will reset ${user.first_name} ${user.last_name}'s password. Please make sure to inform them of the change.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#2ecc71',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, reset it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.put(`/users/${user.id}/reset`)
          .then(() => {
            Swal.fire('Reset!', 'User password has been reset.', 'success');
            onClose();
          })
          .catch(err => {
            console.error('Reset error:', err.response?.data || err.message);
            Swal.fire('Error', 'Could not reset user password.', 'error');
          });
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axiosClient.put(`/users/${user.id}`, formData)
    .then((res) => {
      Swal.fire('Saved!', 'User has been updated.', 'success');
      onSave(res.data.user);
      onClose();
    })
    .catch((err) => {
      console.error('Error:', err.response?.data || err.message);
      Swal.fire('Error', 'There was a problem saving the user.', 'error');
    });
  };


  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Edit User</h2>
        <form className="add-form" onSubmit={handleSubmit}>
          <div className="name-row">
            <div className="half">
                <label>First Name</label>
                <input type="text" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
            </div>
            <div className="half">
                <label>Last Name</label>
                <input type="text" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
            </div>
          </div>

          <label>Email</label>
          <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />

          <label>Phone</label>
          <input type="tel" size="11" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />

          <label>Address</label>
          <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />

          <label>Gender</label>
          <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
            <option value="">Select gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>

          <label>Role</label>
          <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
            <option value="">Select role</option>
            <option value="cook">Cook</option>
            <option value="stylist">Stylist</option>
            <option value="head waiter">Head Waiter</option>
          </select>

          <div className="modal-buttons">
            <button type="button" className="user-save-btn" onClick={() => handleResetPass()}>Reset Pass</button>
            <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="user-save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;
