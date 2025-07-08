import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useParams } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import Swal from 'sweetalert2';
import TaskBoard from '../../components/TaskBoard';
import VenuePreview from '../../components/VenuePreview';
import './BookingDetails.css';

function BookingDetails() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user'));
  const [booking, setBooking] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8000/api/bookings/${id}`)
    .then(res => res.json())
    .then(data => {console.log("RAW BOOKING RESPONSE:", data);setBooking(mapBookingData(data.booking))});

    fetch('http://localhost:8000/api/foods')
      .then(res => res.json())
      .then(data => setFoods(data.foods))
      .catch(err => console.error('Failed to fetch foods:', err));
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

  const groupedFoods = foods.reduce((acc, food) => {
    const type = food.food_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(food);
    return acc;
  }, {});

  const handleEdit = () => {
    setEditedData({
      ...booking,
      menuSelections: Object.entries(booking.menu || {}).reduce((acc, [type, names]) => {
        const selectedFoodName = names[0];
        const matchedFood = foods.find(f => f.food_name === selectedFoodName);
        if (matchedFood) acc[type] = matchedFood.food_id;
        return acc;
      }, {}),
      event_location: ['Airconditioned Room', 'Pavilion', 'Pool'].includes(booking.event_location)
        ? booking.event_location
        : 'outside',
      custom_location: ['Airconditioned Room', 'Pavilion', 'Pool'].includes(booking.event_location)
        ? ''
        : booking.event_location,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    const selectedFoodNames = Object.values(editedData.menuSelections || {})
    .map((foodId) => {
      const food = foods.find(f => f.food_id === parseInt(foodId));
      return food ? food.food_name : null;
    })
    .filter(Boolean);

    fetch(`http://localhost:8000/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: editedData.event_name,
        event_location: editedData.event_location === 'outside' ? editedData.custom_location : editedData.event_location,
        event_type: editedData.event_type,
        celebrant_name: editedData.celebrant_name,
        age: editedData.age,
        watcher: editedData.bantay,
        special_request: editedData.special_request,
        food_names: selectedFoodNames
      }),
    })
      .then(res => res.json())
      .then(data => {
        Swal.fire('Saved!', 'Booking updated.', 'success').then(() => {
          setIsEditing(false);
          window.location.reload();
        });
      })
      .catch(err => {
        console.error(err);
        Swal.fire('Error', 'Could not save changes.', 'error');
      });
  };

  const handleAddPayment = () => {
    alert('Add payment clicked');
  };

  const handleFinish = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: `This will mark the event as finished.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, finish it!',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:8000/api/bookings/${id}/finish`, {
          method: 'POST'
        })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(() => {
          Swal.fire('Marked as Done!', 'Event finished.', 'success').then(() =>{
            window.location.reload();
          });
        })
        .catch(err => {
          console.error('Update error:', err);
          Swal.fire('Error', 'Could not update client.', 'error');
        });
      }
    });
  };

  const canEditBooking = () => {
    const today = new Date();
    const eventDate = new Date(booking.event_start);
    const oneWeekBefore = new Date(eventDate);
    oneWeekBefore.setDate(eventDate.getDate() - 7);
    return today < oneWeekBefore;
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
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="save-btn-small">Save Changes</button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedData({});
                    }}
                    className="cancel-btn-small"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {booking.booking_status !== 'Finished' && (
                    <>
                      <button onClick={handleFinish} className="finish-btn">Mark as Finished</button>
                      {canEditBooking() && <button onClick={handleEdit} className="booking-edit-btn">Edit Details</button>}
                    </>
                  )}
                </>
              )}
            </div>

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
              <span>Event Name:</span>
              {isEditing ? (
                <input
                  value={editedData.event_name}
                  onChange={e => setEditedData({ ...editedData, event_name: e.target.value })}
                />
              ) : (
                <span>{booking.event_name}</span>
              )}
            </div>
            <div>
              <span>Event Location:</span>
              {isEditing ? (
                <>
                  <select
                    value={editedData.event_location}
                    onChange={e => setEditedData({ ...editedData, event_location: e.target.value })}
                  >
                    <option value="">Select Venue</option>
                    <option value="Airconditioned Room">Airconditioned Room</option>
                    <option value="Pavilion">Pavilion</option>
                    <option value="Pool">Pool</option>
                    <option value="outside">Outside Location</option>
                  </select>

                  {editedData.event_location === 'outside' && (
                    <input
                      type="text"
                      placeholder="Type full address here"
                      value={editedData.custom_location || ''}
                      onChange={e => setEditedData({ ...editedData, custom_location: e.target.value })}
                    />
                  )}
                </>
              ) : (
                <span>
                  {['Airconditioned Room', 'Pavilion', 'Pool'].includes(booking.event_location)
                    ? booking.event_location
                    : `Outside Location - ${booking.event_location}`}
                </span>
              )}
            </div>

            <div>
              <span>Event Type:</span>
              {isEditing ? (
                <select name="event_type" value={editedData.event_type} onChange={e => setEditedData({ ...editedData, event_type: e.target.value })}>
                  <option value="">Select Type</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Corporate">Corporate</option>
                </select>
              ) : (
                <span>{booking.event_type}</span>
              )}
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
              {isEditing ? (
                <input
                  value={editedData.celebrant_name}
                  onChange={e => setEditedData({ ...editedData, celebrant_name: e.target.value })}
                />
              ) : (
                <span>{booking.celebrant_name || 'N/A'}</span>
              )}
            </div>
            <div>
              <span>Celebrant Age:</span>
              {isEditing ? (
                <input
                  type="number"
                  value={editedData.age}
                  onChange={e => setEditedData({ ...editedData, age: e.target.value })}
                />
              ) : (
                <span>{booking.age || 'N/A'}</span>
              )}
            </div>
            <div>
              <span>Watcher/Bantay:</span>
              {isEditing ? (
                <input
                  value={editedData.bantay}
                  onChange={e => setEditedData({ ...editedData, bantay: e.target.value })}
                />
              ) : (
                <span>{booking.bantay || 'N/A'}</span>
              )}
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
              {isEditing ? (
                <textarea
                  value={editedData.special_request}
                  onChange={e => setEditedData({ ...editedData, special_request: e.target.value })}
                />
              ) : (
                <span>{booking.special_request || 'N/A'}</span>
              )}
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
              {Object.entries(groupedFoods).map(([category, items]) => (
                <div className="booking-field-group menu-category" key={category}>
                  <label>{category}</label>
                  {isEditing ? (
                    <select
                      value={editedData.menuSelections[category] || ''}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          menuSelections: { ...editedData.menuSelections, [category]: e.target.value },
                        })
                      }
                    >
                      <option value="">Select {category}</option>
                      {items.map(food => (
                        <option key={food.food_id} value={food.food_id}>{food.food_name}</option>
                      ))}
                    </select>
                  ) : (
                    <ul>
                      {items.map(food => <li key={food.food_id || food}>{food.food_name || food}</li>)}
                    </ul>
                  )}
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
