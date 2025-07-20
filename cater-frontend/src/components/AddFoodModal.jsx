import React, {useState} from 'react';
import Swal from 'sweetalert2';
import './AddFoodModal.css';
import axiosClient from '../axiosClient';

function AddFoodModal({ show, onClose, onSave }) {

  const [formData, setFormData] = useState({
    food_name: '',
    food_description: '',
    food_type: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { food_name, food_type } = formData;
    if (food_name.trim() === '' || food_type.trim() === '') {
      Swal.fire('Incomplete', 'Please fill in the required fields.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this food item?',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          ...formData,
          food_status: 'available'
        };

        axiosClient.post('/foods', payload)
          .then((res) => {
            Swal.fire('Saved!', 'Food has been added.', 'success');
            onSave();
            onClose();
            setFormData({ food_name: '', food_description: '', food_type: '' });
          })
          .catch((err) => {
            console.error('Error:', err.response?.data || err.message);
            Swal.fire('Error', 'There was a problem saving the food.', 'error');
          });
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <h2>Add Food</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="add-form food-form">
          <label>Food Name</label>
          <input
            type="text"
            name="food_name"
            value={formData.food_name}
            onChange={handleChange}
          />

          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <label>Food Type</label>
          <select name="food_type" value={formData.food_type} onChange={handleChange}>
            <option value="">Select type</option>
            <option value="Beef">Beef</option>
            <option value="Pork">Pork</option>
            <option value="Chicken">Chicken</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Pasta or Fish">Pasta or Fish</option>
            <option value="Dessert">Dessert</option>
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

export default AddFoodModal;
