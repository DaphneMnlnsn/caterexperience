import React from 'react';
import Swal from 'sweetalert2';
import './AddUserModal.css';

function AddUserModal({ show, onClose, onSave }) {
  const [formData, setFormData] = React.useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    role: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const isFormValid = Object.values(formData).every(val => val.trim() !== '');
    if (!isFormValid) {
      Swal.fire('Incomplete', 'Please fill in all the fields.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this user?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch('http://localhost:8000/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
          .then(async (res) => {
            if (!res.ok) {
              const text = await res.text();
              throw new Error(`Server error: ${text}`);
            }
            return res.json();
          })
          .then((data) => {
            Swal.fire('Saved!', 'User has been added.', 'success');
            onSave(data.user);
            onClose();
          })
          .catch((err) => {
            console.error('Error:', err);
            Swal.fire('Error', 'There was a problem saving the user.', 'error');
          });
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Add User</h2>
        <form className="add-user-form" onSubmit={handleSubmit}>
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
          <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />

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
            <button type="button" className="user-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="user-save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserModal;
