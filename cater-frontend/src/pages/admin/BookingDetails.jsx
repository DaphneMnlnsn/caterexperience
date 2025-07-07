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
      .then(data => {console.log("RAW BOOKING RESPONSE:", data);setBooking(mapBookingData(data.booking))});
  }, [id]);

  function mapBookingData(raw) {
    return {
      ...raw,
      customer_firstname: raw.customer?.customer_firstname || '',
      customer_middlename: raw.customer?.customer_middlename || '',
      customer_lastname: raw.customer?.customer_lastname || '',
      customer_address: raw.customer?.customer_address || '',
      customer_contact_number: raw.customer?.customer_phone || '',
      event_start: `${raw.event_date}T${raw.event_start_time}`,
      event_end: `${raw.event_date}T${raw.event_end_time}`,
      bantay: raw.watcher || '',
      num_waiters: raw.waiter_count || '',
      package: raw.package || {},
      theme: raw.theme || {},
      menu: groupMenuByCategory(raw.menu?.foods || []),
      pax: raw.pax || '',
      staffs: groupStaffByRole(raw.staff_assignments || []),
      tasks: raw.tasks || [],
      payments: raw.payments || [],
      down_payment: raw.payments?.[0]?.amount_paid || 0,
      amount_paid: raw.payments?.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0) || 0,
      total_amount: raw.event_total_price,
      venue_design_image: raw.venue_design_image || null,
    };
  }

  function groupMenuByCategory(foods) {
    const grouped = {};
    foods.forEach(food => {
      const category = food.food_type || 'Uncategorized';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(food.food_name);
    });
    return grouped;
  }

  function groupStaffByRole(assignments) {
    const grouped = { cook: [], stylist: [], headwaiter: [] };
    for (const a of assignments) {
      const role = a.user?.role?.toLowerCase().replace(/\s+/g, '');
      if (role && grouped[role]) {
        grouped[role].push(`${a.user.first_name} ${a.user.last_name}`);
      }
    }
    return grouped;
  }


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
            <div>
              <span>Client Name:</span>
              <span>{booking.customer_firstname} {booking.customer_middlename} {booking.customer_lastname}</span>
            </div>
            <div>
              <span>Client Address:</span>
              <span>{booking.customer_address}</span>
            </div>
            <div>
              <span>Client Contact Number:</span>
              <span>{booking.customer_contact_number}</span>
            </div>
            <div>
              <span>Event Location:</span>
              <span>{booking.event_location}</span>
            </div>
            <div>
              <span>Event Type:</span>
              <span>{booking.event_type}</span>
            </div>
            <div>
              <span>Event Schedule:</span>
              <span>
                {new Date(booking.event_start).toLocaleDateString()},<br />
                {new Date(booking.event_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                {new Date(booking.event_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div>
              <span>Celebrant Name:</span>
              <span>{booking.celebrant_name || 'N/A'}</span>
            </div>
            <div>
              <span>Celebrant Age:</span>
              <span>{booking.age || 'N/A'}</span>
            </div>
            <div>
              <span>Watcher/Bantay:</span>
              <span>{booking.bantay || 'N/A'}</span>
            </div>
            <div>
              <span>Cook:</span>
              <span>{booking.staffs?.cook?.join(', ') || 'N/A'}</span>
            </div>
            <div>
              <span>Stylist:</span>
              <span>{booking.staffs?.stylist?.join(', ') || 'N/A'}</span>
            </div>
            <div>
              <span>Head Waiter/s:</span>
              <span>{booking.staffs?.headwaiter?.join(', ') || 'N/A'}</span>
            </div>
            <div>
              <span>Number of Waiters:</span>
              <span>{booking.num_waiters}</span>
            </div>
            <div>
              <span>Special Requests:</span>
              <span>{booking.special_request || 'N/A'}</span>
            </div>
          </div>
          </div>

        <hr className="booking-section-divider" />

        {/* Menu & Packages */}
        <div className="section white-bg">
          <h3>Menu & Packages</h3>
          <div className="menu-package-container">
            <div className="menu-left">
              <p><strong>Package:</strong> {booking.package?.package_name} – {booking.pax} pax</p>
              <p><strong>Theme:</strong> {booking.theme?.theme_name}</p>
            </div>
            <div className="menu-right">
              <h4 className="menu-title">Menu</h4>
              {Object.entries(booking.menu).map(([category, items], idx) => (
                <div key={idx} className="menu-category">
                  <strong>{category}</strong>
                  <ul>
                    {items.map((food, i) => (
                      <li key={i}>{food}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
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
            <button className="booking-edit-btn" onClick={handleAddPayment}>+ Add New Payment</button>
          </div>

          <div className="payments-info">
            <p><strong>Down payment:</strong> Php {parseFloat(booking.down_payment).toLocaleString()}.00</p>
            <p><strong>Remaining Balance:</strong> Php {(parseFloat(booking.total_amount) - parseFloat(booking.amount_paid)).toLocaleString()}.00</p>
          </div>

          <div className="booking-table-wrapper">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Amount Paid</th>
                  <th>Payment Date</th>
                  <th>Payment Method</th>
                  <th>Payment Remarks</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {booking.payments?.map((payment, index) => (
                  <tr key={index}>
                    <td>Php {parseFloat(payment.amount_paid).toLocaleString()}</td>
                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td>{payment.payment_method}</td>
                    <td>{payment.remarks}</td>
                    <td><i className="fa fa-receipt"></i></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="booking-delete-section">
          <button className="booking-delete-btn" >Delete Booking</button>
        </div>
      </div>
    </div>
  );
}

export default BookingDetails;
