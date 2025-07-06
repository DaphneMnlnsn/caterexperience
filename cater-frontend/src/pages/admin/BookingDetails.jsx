import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useParams } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import TaskBoard from '../../components/TaskBoard';
import VenuePreview from '../../components/VenuePreview';
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
    setIsEditing(false);
  };

  const handleAddPayment = () => {
    alert('Add payment clicked');
  };

  const handleFinish = () => {
    fetch(`http://localhost:8000/api/bookings/${id}/finish`, {
      method: 'POST'
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(() => {
      setBooking(b => ({ ...b, status: 'finished' }));
    })
    .catch(() => alert('Unable to mark event as finished.'));
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
            <div className="action-buttons">
              {!isEditing && (
                <>
                  <button onClick={handleFinish} className="finish-btn">Mark as Finished</button>
                  <button onClick={handleEdit} className="booking-edit-btn">Edit Details</button>
                </>
              )}
            </div>

            {isEditing && <button onClick={handleSave} className="save-btn">Save</button>}
          </div>
          <div className="info-grid">
            <div><span>Client Name:</span><span>{booking.customer_firstname} {booking.customer_middlename} {booking.customer_lastname}</span></div>
            <div><span>Client Address:</span><span>{booking.customer_address}</span></div>
            <div><span>Client Contact Number:</span><span>{booking.customer_contact_number}</span></div>
            <div><span>Event Location:</span><span>{booking.event_location}</span></div>
            <div><span>Event Type:</span><span>{booking.event_type}</span></div>
            <div><span>Event Schedule:</span><span>{new Date(booking.event_start).toLocaleString()} - {new Date(booking.event_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
            <div><span>Celebrant Name:</span><span>{booking.celebrant_name}</span></div>
            <div><span>Celebrant Age:</span><span>{booking.celebrant_age}</span></div>
            <div><span>Bantay:</span><span>{booking.bantay}</span></div>
            <div><span>Cook:</span><span>{booking.staffs?.cook?.join(', ')}</span></div>
            <div><span>Stylist:</span><span>{booking.staffs?.stylist?.join(', ')}</span></div>
            <div><span>Head Waiters:</span><span>{booking.staffs?.head_waiter?.join(', ')}</span></div>
            <div><span>Number of Waiters:</span><span>{booking.num_waiters}</span></div>
            <div><span>Event Notes:</span><span>{booking.event_notes || "N/A"}</span></div>
          </div>
        </div>

        <hr className="booking-section-divider" />

        {/* Menu & Packages */}
        <div className="section white-bg">
          <h3>Menu & Packages</h3>
          <p><strong>Package:</strong> {booking.package?.name} - {booking.package?.pax} pax</p>
          <p><strong>Theme:</strong> {booking.theme?.name}</p>
          <p><strong>Menu:</strong> {
            Array.isArray(booking.menu)
              ? booking.menu.map(item => item.food_name).join(', ')
              : 'N/A'
          }</p>
        </div>

        <hr className="booking-section-divider" />

        {/* Task Board */}
        <div className="section black-bg">
          <h3>Task Board</h3>
          <TaskBoard tasks={booking.tasks || []} />
        </div>

        <hr className="booking-section-divider" />

        {/* Venue Design Preview */}
        <div className="section white-bg">
          <h3>Venue Design</h3>
          <VenuePreview imagePath={booking.venue_design_image} />
        </div>

        <hr className="booking-section-divider" />

        {/* Payments Table */}
        <div className="section white-bg">
          <div className="section-title">
            <h3>Payments</h3>
            <button className="edit-btn" onClick={handleAddPayment}>+ Add New Payment</button>
          </div>

          <div className="payments-info">
            <p><strong>Down payment:</strong> Php {parseFloat(booking.down_payment).toLocaleString()}.00</p>
            <p><strong>Remaining Balance:</strong> Php {(parseFloat(booking.total_amount) - parseFloat(booking.amount_paid)).toLocaleString()}.00</p>
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
                {booking.payments?.map((payment, index) => (
                  <tr key={index}>
                    <td>{payment.reference_no}</td>
                    <td>{parseFloat(payment.amount).toLocaleString()}</td>
                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td>{payment.method}</td>
                    <td><i className="fa fa-receipt"></i></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingDetails;
