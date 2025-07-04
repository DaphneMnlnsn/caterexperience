import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useParams } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import './BookingDetails.css';

function BookingDetails() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user'));
  const [booking, setBooking] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetch(`http://localhost:8000/api/bookings/${id}`)
      .then(res => res.json())
      .then(data => setBooking(data.booking));
  }, [id]);

  const handleEdit = () => {
    setEditedData({ ...booking });
    setIsEditing(true);
  };

  const handleSave = () => {
    // save
    setIsEditing(false);
  };

  const handleAddPayment = () => {
    // modal for payment
    alert('Add payment clicked');
  };

  if (!booking) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content scrollable">
        <header className="topbar">
          <div></div>
          <div className="topbar-right">
            <span className="user-name">{user?.first_name} {user?.last_name}</span>
            <FaBell className="notif-icon" />
          </div>
        </header>

        {/* Event Details */}
        <div className="section white-bg">
          <div className="section-title">
            <h3>Event Details</h3>
            {!isEditing && <button onClick={handleEdit} className="edit-btn">Edit Details</button>}
            {isEditing && <button onClick={handleSave} className="save-btn">Save</button>}
          </div>
          <div className="info-grid">
            <p><strong>Client Name:</strong> {booking.customer_firstname} {booking.customer_middlename} {booking.customer_lastname}</p>
            <p><strong>Event Location:</strong> {booking.event_location}</p>
            <p><strong>Event Type:</strong> {booking.event_type}</p>
            <p><strong>Event Schedule:</strong> {/*booking.schedule*/}</p>
            <p><strong>Assigned Staff:</strong> Cook - {/*booking.staff.cook*/}, Stylist - {/*booking.staff.stylist*/}</p>
          </div>
        </div>

        {/* Menu & Packages */}
        <div className="section white-bg">
          <h3>Menu & Packages</h3>
          <p><strong>Package:</strong> {/*booking.package.name*/}</p>
          <p><strong>Theme:</strong> {/*booking.package.theme*/}</p>
          <p><strong>Menu:</strong> {/*booking.package.menu.join(', ')*/}</p>
        </div>

        {/* Task Board Placeholder */}
        <div className="section black-bg">
          <h3>Task Board</h3>
          <p style={{ color: '#ccc' }}>[Task board here]</p>
        </div>

        {/* Venue Design Preview */}
        <div className="section white-bg">
          <h3>Venue Design</h3>
          <div className="venue-preview">
            [Preview here]
            <button className="edit-btn">Edit 2D Design</button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="section white-bg">
          <div className="section-title">
            <h3>Payments</h3>
            <button className="edit-btn" onClick={handleAddPayment}>+ Add New Payment</button>
          </div>

          <div className="payments-info">
            <p><strong>Down payment:</strong> Php {/*booking.down_payment.toLocaleString()*/}.00</p>
            <p><strong>Remaining Balance:</strong> Php {/*booking.remaining_balance.toLocaleString()*/}.00</p>
          </div>

          <div className="booking-table-wrapper">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Payment #</th>
                  <th>Amount Paid</th>
                  <th>Payment Date</th>
                  <th>Payment Method</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/*booking.payments.map((payment, index) => (
                  <tr key={index}>
                    <td>{payment.reference_no}</td>
                    <td>{parseFloat(payment.amount).toLocaleString()}</td>
                    <td>{payment.date}</td>
                    <td>{payment.method}</td>
                    <td><i className="fa fa-receipt"></i></td>
                  </tr>
                ))*/}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BookingDetails;