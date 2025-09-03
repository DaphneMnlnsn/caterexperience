import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import VenuePreview from '../components/VenuePreview';
import './BookingDetails.css';
import axiosClient from '../axiosClient';
import Invoice from '../components/Invoice';

function BookingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
  const [showInvoice, setShowInvoice] = useState(false);
  const [booking, setBooking] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [foods, setFoods] = useState([]);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [inventorySummary, setInventorySummary] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editedRow, setEditedRow] = useState({});

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = () => {
    axiosClient.get(`/bookings/public/${id}`)
      .then(res => {
        setBooking(mapBookingData(res.data.booking));

        const bookingFromServer = res.data.booking || {};

        const mapped = (bookingFromServer.tasks || []).map(task => ({
          id: task.task_id,
          task_name: task.title,
          status: task.status,
          deadline: task.due_date,
          assigned_to_name: task.assignee
            ? `${toTitleCase(task.assignee.role)} ${task.assignee.first_name}`
            : 'Unassigned',
          assignee: task.assignee || null,
          priority: task.priority,
          booking_ref: 'Task-' + (task.task_id ?? 'N/A')
        }));
        setTasks(mapped);

        const staffList = [
          ...res.data.booking.staff_assignments.map(sa => ({
            id: sa.user.id,
            name: `${sa.user.first_name} ${sa.user.last_name}`,
            role: sa.user.role
          }))
        ];

        const uniqueStaff = staffList.filter(
          (staff, index, self) => index === self.findIndex(s => s.id === staff.id)
        );

        setAvailableStaff(uniqueStaff);
      })
      .catch(err => {
        console.error('Failed to fetch booking details:', err.response?.data || err.message);
      });

    axiosClient.get('/foods')
      .then(res => setFoods(res.data.foods || []))
      .catch(err => console.error('Failed to fetch foods:', err.response?.data || err.message));
  };

  function toTitleCase(str) {
    return (str || '')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function mapBookingData(raw) {
    if (!raw) return null;
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

  function groupMenuByCategory(foodsList) {
    const grouped = {};
    foodsList.forEach(food => {
      const category = food.food_type || 'Uncategorized';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(food.food_name);
    });
    return grouped;
  }

  const groupedFoods = foods.reduce((acc, food) => {
    const type = food.food_type || 'Uncategorized';
    if (!acc[type]) acc[type] = [];
    acc[type].push(food);
    return acc;
  }, {});

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

  if (!booking) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="main-content scrollable">
        <header className="topbar">
        <FaArrowLeft style={{'font-size':16, 'cursor':'pointer'}} onClick={() => navigate(-1)}/>
          <div></div>
          <div className="topbar-right">
          </div>
        </header>

        {/* Event Details */}
        <div className="section white-bg">
          <div className="section-title">
            <h3>Event Details</h3>
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
                <span>{booking.event_name}</span>
            </div>
            <div>
              <span>Event Location:</span>
                <span>
                    {['Airconditioned Room', 'Pavilion', 'Pool'].includes(booking.event_location)
                    ? booking.event_location
                    : `Outside Location - ${booking.event_location}`}
                </span>
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
          <div className="section-header">
            <h3>Menu & Packages</h3>
          </div>
          <div className="menu-package-container">
            <div className="menu-left">
              <p>
                <strong>Package:</strong> {booking.package?.package_name}
                {booking.package_price && (
                  <> | {booking.package_price.price_label}: ₱{parseFloat(booking.package_price.price_amount).toLocaleString()}</>
                )}
              </p>
              <p><strong>Theme:</strong> {booking.theme?.theme_name}</p>
            </div>
            <div className="menu-right">
              <h4 className="menu-title">Menu</h4>
              {Object.entries(booking.menu).map(([category, selectedFoodNames]) => (
                <div className="booking-field-group menu-category" key={category}>
                  <label>{category}</label>
                    <ul>
                      {selectedFoodNames.map((foodName) => (
                        <li key={foodName}>{foodName}</li>
                      ))}
                    </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="addons-section">
            <h4>Selected Add-ons</h4>
            {booking.event_addons?.length ? (
              <ul className="addons-list">
                {booking.event_addons.map((addon) => (
                  <li key={addon.id}>
                    {addon.addon?.addon_name} ({addon.addon_price?.description}) × {addon.quantity} = 
                    ₱{parseFloat(addon.total_price).toLocaleString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No add-ons selected.</p>
            )}
            <p><strong>Freebies:</strong> {booking.freebies || 'None'}</p>
          </div>
        </div>

        <hr className="booking-section-divider" />

        {/* Venue Design Preview */}
          <>
            <div className="section white-bg">
              <div className="section-header">
                <h3>Venue Design</h3>
              </div>
              <VenuePreview bookingId={booking.booking_id} isClient={true}/>
            </div>

            <hr className="booking-section-divider" />
          </>

        {/* Payments Table */}
          <div className="section white-bg">
            <div className="section-title">
              <h3>Payments</h3>
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
                      <td onClick={() => {
                        setShowInvoice(true);
                        setSelectedPayment(payment.payment_id);
                      }}><i className="fa fa-receipt"></i></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>

        <Invoice show={showInvoice} onClose={() => setShowInvoice(false)} selectedPayment={selectedPayment}/>
    </div>
  );
}

export default BookingDetails;
