import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useParams } from 'react-router-dom';
import { FaPen, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import TaskBoard from '../components/TaskBoard';
import AddTaskModal from '../components/AddTaskModal';
import VenuePreview from '../components/VenuePreview';
import './BookingDetails.css';
import axiosClient from '../axiosClient';
import AddPaymentModal from '../components/AddPaymentModal';
import AddBookingItemModal from '../components/AddBookingItemModal';
import Invoice from '../components/Invoice';
import MenuChecklist from '../components/MenuChecklist';
import RequestChangesModal from '../components/RequestChangesModal';
import Header from '../components/Header';
import AddExtraChargeModal from '../components/AddExtraChargeModal';
import ExtraChargesModal from '../components/ExtraChargesModal';
import RescheduleModal from '../components/RescheduleModal';
import FeedbackModal from '../components/FeedbackModal';

function BookingDetails() {
  const { id } = useParams();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;

  const hasRole = (roles) => {
    if (!user?.role) return false;
    const current = String(user.role).toLowerCase();
    if (Array.isArray(roles)) {
      return roles.some(r => String(r).toLowerCase() === current);
    }
    return String(roles).toLowerCase() === current;
  };

  const isAdmin = hasRole('admin');
  const isStylist = hasRole('stylist');
  const isCook = hasRole('cook');
  const isWaiter = hasRole('head waiter');
  const isClient = hasRole('client');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);
  const [seeRequests, setSeeRequests] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [showChargesModal, setShowChargesModal] = useState(false);
  const [showReschedModal, setShowReschedModal] = useState(false);
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
  const [originalRow, setOriginalRow] = useState({});
  const [availableAddons, setAvailableAddons] = useState([]);
  const [addonTiersMap, setAddonTiersMap] = useState({});
  const [totalQuantity, setTotalQuantity] = useState(0);
  
  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = () => {
    axiosClient.get(`/bookings/${id}`)
      .then(res => {
        setBooking(mapBookingData(res.data.booking));

        const bookingFromServer = res.data.booking || {};

        const mapped = (bookingFromServer.tasks || []).map(task => ({
          id: task.task_id,
          task_name: task.title,
          created_by: task.created_by,
          description: task.description,
          status: task.status,
          deadline: task.due_date,
          assigned_to_name: task.assignee
            ? (task.assignee.role.toLowerCase() === 'head waiter'
                ? 'Head Waiter'
                : `${toTitleCase(task.assignee.role)} ${task.assignee.first_name}`)
            : 'Unassigned',
          assignee: task.assignee || null,
          priority: task.priority,
          booking_ref: 'Task-' + (task.task_id ?? 'N/A')
        })).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        setTasks(mapped);

        const staffList = [
          ...res.data.booking.staff_assignments.map(sa => ({
            id: sa.user.id,
            name: `${sa.user.first_name} ${sa.user.last_name}`,
            role: sa.user.role
          })),
          {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role
          }
        ];

        const uniqueStaff = staffList.filter(
          (staff, index, self) => index === self.findIndex(s => s.id === staff.id)
        );

        setAvailableStaff(uniqueStaff);
      })
      .catch(err => {
        console.error('Failed to fetch booking details:', err.response?.data || err.message);
      });

    axiosClient.get('/addons').then(res => {
      const addonsData = res.data.addons || [];
      setAvailableAddons(addonsData);

      const tiersMap = {};
      addonsData.forEach(addon => {
        const prices = addon.prices || addon.addon_prices || addon.addon_price || [];
        if (prices.length > 0) {
          tiersMap[addon.addon_id] = prices;
        }
      });
      setAddonTiersMap(tiersMap);
    });

    axiosClient.get('/foods')
      .then(res => setFoods(res.data.foods || []))
      .catch(err => console.error('Failed to fetch foods:', err.response?.data || err.message));

    axiosClient.get(`/bookings/${id}/inventory-summary`)
      .then(res => setInventorySummary(res.data || []))
      .catch(err => console.error('Failed to fetch inventory summary:', err.response?.data || err.message));
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
    const type = food.food_type || 'Uncategorized';
    if (!acc[type]) acc[type] = [];
    acc[type].push(food);
    return acc;
  }, {});

  const handleEdit = () => {
    if (!isAdmin) return;

    setEditedData({
      ...booking,
      menuSelections: Object.entries(booking.menu || {}).reduce((acc, [type, names]) => {
        const selectedFoodName = names[0];
        const matchedFood = foods.find(f => f.food_name === selectedFoodName);
        if (matchedFood) acc[type] = matchedFood.food_id;
        return acc;
      }, {}),
      event_addons: (booking.event_addons || []).map(a => ({
        addon_id: parseInt(a.addon_id ?? a.addon?.addon_id ?? ''),
        addon_price_id: parseInt(a.addon_price_id ?? a.addon_price?.addon_price_id ?? ''),
        quantity: a.quantity ?? 1,
      })),
      freebies: booking.freebies || '',
      event_location: ['Airconditioned Room', 'Pavilion', 'Poolside'].includes(booking.event_location)
        ? booking.event_location
        : 'outside',
      custom_location: ['Airconditioned Room', 'Pavilion', 'Poolside'].includes(booking.event_location)
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

    const selectedAddons = (editedData.event_addons || [])
    .filter(a => a.addon_id)
    .map(a => ({
      addon_id: parseInt(a.addon_id),
      addon_price_id: a.addon_price_id ? parseInt(a.addon_price_id) : null,
      quantity: parseInt(a.quantity) || 1
    }));

    const payload = {
      event_name: editedData.event_name,
      event_location:
        editedData.event_location === 'outside'
          ? editedData.custom_location
          : editedData.event_location,
      event_type: editedData.event_type,
      celebrant_name: editedData.celebrant_name,
      age: editedData.age,
      watcher: editedData.bantay,
      special_request: editedData.special_request,
      food_names: selectedFoodNames,
      freebies: editedData.freebies || null,
      event_addons: selectedAddons,
    };

    axiosClient
      .put(`/bookings/${id}`, payload)
      .then(() => {
        Swal.fire('Saved!', 'Booking updated.', 'success').then(() => {
          setIsEditing(false);
          fetchDetails();
        });
      })
      .catch(err => {
        console.error(err.response?.data || err.message);
        Swal.fire('Error', 'Could not save changes.', 'error');
      });
  };

  const handleFinish = () => {
    if (!isAdmin) return;
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
        axiosClient.post(`/bookings/${id}/finish`)
          .then(() => {
            Swal.fire('Marked as Done!', 'Event finished.', 'success').then(() => {
              fetchDetails();
            });
          })
          .catch(err => {
            console.error('Update error:', err.response?.data || err.message);
            Swal.fire('Error', 'Could not finish event.', 'error');
          });
      }
    });
  };

  const handleCancel = () => {
    if (!isAdmin) return;
    Swal.fire({
      title: 'Are you sure you want to cancel?',
      text: `This cannot be undone. It will also delete tasks for the staff.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, cancel it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.post(`/bookings/${id}/cancel`)
          .then(() => {
            Swal.fire('Cancelled!', 'Event cancelled.', 'success').then(() => {
              fetchDetails();
            });
          })
          .catch(err => {
            console.error('Update error:', err.response?.data || err.message);
            Swal.fire('Error', 'Could not cancel event.', 'error');
          });
      }
    });
  };

  const handleSaveRow = async (bookingInventoryId) => {
    try {
      const assigned = Number(editedRow.quantity_assigned ?? originalRow.quantity_assigned ?? 0);
      const used = Number(editedRow.quantity_used ?? originalRow.quantity_used ?? 0);
      const returned = Number(editedRow.quantity_returned ?? originalRow.quantity_returned ?? 0);

      if (assigned < 0) {
        Swal.fire('Invalid', 'Assigned quantity cannot be negative.', 'warning');
        return;
      }
      if (used > totalQuantity) {
        Swal.fire('Invalid', 'Used quantity cannot exceed the total quantity of items.', 'warning');
        return;
      }
      if (used < 0 || returned < 0) {
        Swal.fire('Invalid', 'Used/Returned quantities cannot be negative.', 'warning');
        return;
      }
      if (returned > used) {
        Swal.fire('Invalid', 'Returned quantity cannot exceed used.', 'warning');
        return;
      }
      if (returned > totalQuantity) {
        Swal.fire('Invalid', 'Returned quantity cannot exceed the total quantity of items.', 'warning');
        return;
      }

      if (isAdmin) {
        await axiosClient.put(`/assigned-inventory/${bookingInventoryId}`, {
          quantity_assigned: assigned,
          remarks: editedRow.remarks,
        });

        const usageChanged =
          used !== Number(originalRow.quantity_used ?? 0) ||
          returned !== Number(originalRow.quantity_returned ?? 0);

        if (usageChanged) {
          await axiosClient.put(`/inventory-usage/${bookingInventoryId}`, {
            quantity_used: used,
            quantity_returned: returned,
            remarks: editedRow.remarks,
          });
        }
      } else {
        await axiosClient.put(`/inventory-usage/${bookingInventoryId}`, {
          quantity_used: used,
          quantity_returned: returned,
          remarks: editedRow.remarks,
        });
      }

      await fetchDetails();

      setEditingRowId(null);
      setEditedRow({});
      Swal.fire('Saved!', 'Inventory updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save inventory changes.', 'error');
    }
  };

  const handleDelete = async (bookingInventoryId) => {
    if (!isAdmin) return;
    const confirm = await Swal.fire({
      title: 'Delete Item?',
      text: 'This will remove the inventory assignment.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        await axiosClient.delete(`/assigned-inventory/${bookingInventoryId}`);
        fetchDetails();
        Swal.fire('Deleted!', 'Inventory item removed.', 'success');
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Failed to delete item.', 'error');
      }
    }
  };

  const canEditBooking = () => {
    if (!booking) return false;
    const today = new Date();
    const eventDate = new Date(booking.event_start);
    const oneWeekBefore = new Date(eventDate);
    oneWeekBefore.setDate(eventDate.getDate() - 7);
    return today < oneWeekBefore;
  };

  const canEditSetup = () => {
    if (!booking) return false;
    const today = new Date();
    const eventDate = new Date(booking.event_start);
    const fiveDaysBefore = new Date(eventDate);
    fiveDaysBefore.setDate(eventDate.getDate() - 5);
    return today < fiveDaysBefore;
  };

  const handleFinishClick = () => {
    const unreturnedItems = inventorySummary?.filter(
      (item) => parseFloat(item.quantity_returned || 0) == 0
    );

    if (unreturnedItems && unreturnedItems.length > 0) {
      const itemList = unreturnedItems
        .map(
          (item) =>
            `${item.item_name} (${item.quantity_assigned - (item.quantity_returned || 0)} unreturned),`
        )
        .join('\n');

      Swal.fire({
        title: 'Unreturned Items Detected',
        text: `The following items have not been fully returned:\n\n${itemList}`,
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    const balance = parseFloat(booking.final_amount) - parseFloat(booking.amount_paid);

    if (balance !== 0) {
      Swal.fire({
        title: 'Unpaid Balance',
        text: `This event still has an outstanding balance of ₱${balance.toLocaleString()}. Do you still want to mark it as finished?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, finish it',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          handleFinish();
        }
      });
    } else {
      handleFinish();
    }
  };

  if (!booking) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content scrollable">
        <Header user={user} />

        {/* Event Details */}
        <div className="section white-bg">
          <div className="section-title">
            <h3>Event Details</h3>
            <div className="action-buttons">
              {booking.booking_status !== 'Finished' && booking.booking_status !== 'Cancelled' && (isAdmin || isStylist || isClient) && (
                <button className="booking-edit-btn" onClick={() => {setShowRequestChangesModal(true); setSeeRequests(true);}}>See Requested Changes</button>
              )}
              {booking.booking_status !== 'Finished' && booking.booking_status !== 'Cancelled' && isClient && canEditBooking() && (
                <button className="booking-edit-btn" onClick={() => {setShowRequestChangesModal(true); setSeeRequests(false);}}>Request Changes</button>
              )}
              {isClient &&
                booking.booking_status !== 'Cancelled' &&
                new Date(booking.event_date + ' ' + booking.event_end_time) <= new Date() && (
                  <>
                    <button onClick={() => setShowFeedbackModal(true)} className="booking-edit-btn">Rate your Experience</button>
                  </>
              )}
              {isAdmin &&
                booking.booking_status !== 'Cancelled' &&
                new Date(booking.event_date + ' ' + booking.event_end_time) <= new Date() && (
                  <>
                    <button onClick={() => setShowFeedbackModal(true)} className="booking-edit-btn">Show Customer Feedback</button>
                  </>
              )}
              {isEditing ? (
                <>
                  {isAdmin && <button onClick={handleSave} className="save-btn-small">Save Changes</button>}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedData({});
                      }}
                      className="cancel-btn-small"
                    >
                      Cancel
                    </button>
                  )}
                </>
              ) : (
                <>
                  {isAdmin &&
                  booking.booking_status !== 'Finished' &&
                  booking.booking_status !== 'Cancelled' &&
                  new Date(booking.event_date + ' ' + booking.event_end_time) <= new Date() && (
                    <button onClick={handleFinishClick} className="finish-btn">
                      Mark as Finished
                    </button>
                  )}
                  {isAdmin &&
                    booking.booking_status !== 'Finished' &&
                    booking.booking_status !== 'Cancelled' && (
                      <>
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
              <span>Event Code:</span>
              <span>{booking.event_code}</span>
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
                    <option value="Poolside">Poolside</option>
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
                  {['Airconditioned Room', 'Pavilion', 'Poolside'].includes(booking.event_location)
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
                  <option value="Anniversary">Anniversary</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Others">Others</option>
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
              <span>Contact/Watchman:</span>
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
          <div className="section-header">
            <h3>Menu & Packages</h3>
            {booking.booking_status !== 'Finished' && booking.booking_status !== 'Cancelled' && isClient && canEditBooking() && (
              <button className="booking-edit-btn" onClick={() => setShowRequestChangesModal(true)}>Request Changes</button>
            )}
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
                  {isEditing && !isStylist ? (
                    <select
                      value={editedData.menuSelections[category] || ''}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          menuSelections: {
                            ...editedData.menuSelections,
                            [category]: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="">Select {category}</option>
                      {groupedFoods[category]
                      ?.filter(food => food.status !== 'archived')
                      .map(food => (
                        <option key={food.food_id} value={food.food_id}>
                          {food.food_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <ul>
                      {selectedFoodNames.map((foodName) => (
                        <li key={foodName}>{foodName}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="addons-section">
            <div className="booking-field-group" style={{ gridColumn: '1 / span 2' }}>
              <label className="booking-field-label">Add-ons</label>

              {isEditing ? (
                <>
                  {(editedData.event_addons || []).map((row, idx) => (
                    <div
                      key={idx}
                      className="addon-row"
                      style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}
                    >
                      <select
                        value={row.addon_id || ''}
                        onChange={e => {
                          const addonId = parseInt(e.target.value);
                          const newRows = [...(editedData.event_addons || [])];
                          newRows[idx] = { ...newRows[idx], addon_id: addonId, addon_price_id: '', quantity: 1 };
                          setEditedData({ ...editedData, event_addons: newRows });
                        }}
                      >
                        <option value="">Select Add-on…</option>
                        {availableAddons
                        .filter(a => a.status !== 'archived')
                        .map(a => (
                          <option key={a.addon_id} value={a.addon_id}>
                            {a.addon_name}
                          </option>
                        ))}
                      </select>

                      {row.addon_id && addonTiersMap[row.addon_id]?.length > 0 && (
                        <select
                          value={row.addon_price_id || ''}
                          onChange={e => {
                            const tierId = parseInt(e.target.value);
                            const newRows = [...(editedData.event_addons || [])];
                            newRows[idx] = { ...newRows[idx], addon_price_id: tierId };
                            setEditedData({ ...editedData, event_addons: newRows });
                          }}
                        >
                          <option value="">Select Tier…</option>
                          {addonTiersMap[row.addon_id].map(t => (
                            <option key={t.addon_price_id} value={t.addon_price_id}>
                              {t.description} – ₱{parseFloat(t.price).toLocaleString()}
                            </option>
                          ))}
                        </select>
                      )}

                      <input
                        type="number"
                        min="1"
                        value={row.quantity ?? 1}
                        style={{ width: '3rem' }}
                        onChange={e => {
                          const qty = parseInt(e.target.value) || 1;
                          const newRows = [...(editedData.event_addons || [])];
                          newRows[idx] = { ...newRows[idx], quantity: qty };
                          setEditedData({ ...editedData, event_addons: newRows });
                        }}
                      />

                      <button
                        type="button"
                        className="close-btn"
                        onClick={() => {
                          const newRows = [...(editedData.event_addons || [])];
                          newRows.splice(idx, 1);
                          setEditedData({ ...editedData, event_addons: newRows });
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const rows = editedData.event_addons ? [...editedData.event_addons] : [];
                      rows.push({ addon_id: '', addon_price_id: '', quantity: 1 });
                      setEditedData({ ...editedData, event_addons: rows });
                    }}
                    className="addon-btn"
                  >
                    + Add Add-on
                  </button>

                  <div className="booking-field-group" style={{ marginTop: '1rem', gridColumn: '1 / span 2' }}>
                    <label className="booking-field-label">Freebies</label>
                    <input
                      type="text"
                      value={editedData.freebies ?? ''}
                      onChange={e => setEditedData({ ...editedData, freebies: e.target.value })}
                      placeholder="Enter freebies / notes"
                    />
                  </div>
                </>
              ) : (
                <>
                  {booking.event_addons?.length ? (
                    <ul className="addons-list">
                      {booking.event_addons.map(addon => (
                        <li key={addon.id}>
                          {addon.addon?.addon_name}
                          {addon.addon_price?.description ? ` (${addon.addon_price.description})` : ''} ×{' '}
                          {addon.quantity} = ₱{parseFloat(addon.total_price).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No add-ons selected.</p>
                  )}
                  <p><strong>Freebies:</strong> {booking.freebies || 'None'}</p>
                </>
              )}
            </div>
            </div>
        </div>

        <hr className="booking-section-divider" />

        {/* Task Board */}
        {!isClient && (
          <>
            <div className="section white-bg task-section">
              <div className='section-title'>
                <h3>Task Board</h3>
                <>
                  {booking.booking_status !== 'Finished' && booking.booking_status !== 'Cancelled' && (
                    <>
                      <button className="booking-edit-btn" onClick={() => setShowTaskModal(true)}>+ Add New Task</button>
                    </>
                  )}
                </>
              </div>
              <TaskBoard 
                tasks={tasks}
                setTasks={setTasks}
                assignedStaffs={booking.staffs}
                staffOptions={availableStaff}
                isAdmin={isAdmin}
                currentUserId={user.id}
              />
            </div>
            <hr className="booking-section-divider" />
          </>
        )}

        {/* Venue Design Preview */}
        {!isCook && (
          <>
            <div className="section white-bg">
              <div className="section-header">
                <h3>Venue Design</h3>
                {booking.booking_status !== 'Finished' && booking.booking_status !== 'Cancelled' && isClient && canEditBooking() && (
                  <button className="booking-edit-btn" onClick={() => setShowRequestChangesModal(true)}>Request Changes</button>
                )}
              </div>
              <VenuePreview bookingId={booking.booking_id} canEdit={canEditSetup()} isWaiter={isWaiter} isClient={isClient}/>
            </div>

            <hr className="booking-section-divider" />
          </>
        )}

        {/* Menu Checklist */}
        {(isCook || isWaiter || isAdmin) && (
          <>
            <div className="section white-bg">
              <h3>Menu Checklist</h3>
              <MenuChecklist bookingId={booking.booking_id} isCook={isCook} />
            </div>

            <hr className="booking-section-divider" />
          </>
        )}

        {/* Inventory Summary */}
        {!(isCook || isClient) && (
          <>
            <div className="section white-bg">
              <div className="section-title">
                <h3>Inventory Summary</h3>
                {isAdmin && booking.booking_status !== 'Finished' && booking.booking_status !== 'Cancelled' && (
                  <button className="booking-edit-btn" onClick={() => setShowAddItemModal(true)}>
                    + Add Inventory Item
                  </button>
                )}
              </div>

              <div className="booking-table-wrapper">
                <table className="booking-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty Available</th>
                      <th>Qty Assigned</th>
                      <th>Qty Used</th>
                      <th>Qty Returned</th>
                      <th>Remarks</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className='inventory'>
                    {inventorySummary?.length > 0 ? (
                      inventorySummary.map((row) => {
                        const isRowEditing = editingRowId !== null && editingRowId === row.booking_inventory_id;

                        return ( 
                          <tr key={row.booking_inventory_id}>
                            <td>{row.item_name}</td>
                            <td>{row.item_current_quantity}</td>

                            <td>
                              {isRowEditing && isAdmin ? (
                                <input
                                  type="number"
                                  value={editedRow.quantity_assigned ?? ''}
                                  onChange={(e) =>
                                    setEditedRow({
                                      ...editedRow,
                                      quantity_assigned: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                row.quantity_assigned
                              )}
                            </td>

                            <td>
                              {isRowEditing && new Date(booking.event_date + ' ' + booking.event_start_time) <= new Date() ? (
                                <input
                                  type="number"
                                  value={editedRow.quantity_used ?? row.quantity_used ?? ''}
                                  onChange={(e) =>
                                    {setEditedRow({
                                      ...editedRow,
                                      quantity_used: e.target.value,
                                    });
                                    setTotalQuantity(row.item_quantity);}
                                  }
                                />
                              ) : (
                                row.quantity_used ?? '—'
                              )}
                            </td>

                            <td>
                              {isRowEditing && new Date(booking.event_date + ' ' + booking.event_end_time) <= new Date() ? (
                                <input
                                  type="number"
                                  value={editedRow.quantity_returned ?? row.quantity_returned ?? ''}
                                  onChange={(e) =>
                                    {setEditedRow({
                                      ...editedRow,
                                      quantity_returned: e.target.value,
                                    });
                                    setTotalQuantity(row.item_quantity);}
                                  }
                                />
                              ) : (
                                row.quantity_returned ?? '—'
                              )}
                            </td>

                            <td>
                              {isRowEditing && isAdmin ? (
                                <input
                                  type="text"
                                  value={editedRow.remarks ?? ''}
                                  onChange={(e) =>
                                    setEditedRow({ ...editedRow, remarks: e.target.value })
                                  }
                                />
                              ) : (
                                row.remarks ?? 'N/A'
                              )}
                            </td>

                            <td>
                              {booking.booking_status !== 'Finished' &&
                                booking.booking_status !== 'Cancelled' && (
                                  <>
                                    {isRowEditing ? (
                                      <>
                                        <button
                                          className="save-btn-small"
                                          onClick={() => handleSaveRow(row.booking_inventory_id)}
                                        >
                                          Save
                                        </button>
                                        <button
                                          className="cancel-btn-small"
                                          onClick={() => {
                                            setEditingRowId(null);
                                            setEditedRow({});
                                          }}
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <div className="action-buttons">
                                        <FaPen
                                          className="icon edit-icon"
                                          onClick={() => {
                                            if (isStylist || isWaiter) {
                                              setEditingRowId(row.booking_inventory_id);
                                              setEditedRow({
                                                quantity_returned: row.quantity_returned ?? '',
                                              });
                                              setOriginalRow({ ...row });
                                            } else {
                                              setEditingRowId(row.booking_inventory_id);
                                              setEditedRow({
                                                quantity_assigned: row.quantity_assigned ?? '',
                                                quantity_used: row.quantity_used ?? '',
                                                quantity_returned: row.quantity_returned ?? '',
                                                remarks: row.remarks ?? '',
                                              });
                                              setOriginalRow({ ...row });
                                            }
                                          }}
                                        />
                                        {isAdmin && (
                                          <FaTrash
                                            className="icon delete-icon"
                                            onClick={() => handleDelete(row.booking_inventory_id)}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center' }}>
                          No inventory records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <hr className="booking-section-divider" />
          </>
        )}

        {/* Payments Table */}
        {(isAdmin || isClient) && (
          <div className="section white-bg">
            <div className="section-title">
              <h3>Payments</h3>
              <div className='action-buttons'>
                {booking.booking_status !== 'Finished' && booking.booking_status !== 'Cancelled' && isClient && canEditBooking() && (
                  <button className="booking-edit-btn" onClick={() => setShowRequestChangesModal(true)}>Request Changes</button>
                )}
                {booking.booking_status !== 'Finished' && booking.booking_status !== 'Cancelled' && isAdmin && (
                  <button className="booking-edit-btn" onClick={() => setShowChargesModal(true)}>View Extra Charges</button>
                )}
                {booking.booking_status !== 'Finished' && booking.booking_status !== 'Cancelled' && isAdmin && (
                  <button className="booking-edit-btn" onClick={() => setShowAddChargeModal(true)}>+ Add Extra Charge</button>
                )}
                {booking.booking_status !== 'Finished' && booking.booking_status !== 'Cancelled' && (parseFloat(booking.final_amount) - parseFloat(booking.amount_paid)) > 0.00 && isAdmin && (
                  <button className="booking-edit-btn" onClick={() => setShowAddPaymentModal(true)}>+ Add New Payment</button>
                )}
              </div>
            </div>

            <div className="payments-info">
              <p><strong>Total Amount:</strong> Php {parseFloat(booking.final_amount).toLocaleString()}.00</p>
              <p><strong>Remaining Balance:</strong> Php {(parseFloat(booking.final_amount) - parseFloat(booking.amount_paid)).toLocaleString()}.00</p>
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
        )}

        {/* Booking actions */}
        {isAdmin && (
          <div className="booking-delete-section">
            {booking.booking_status !== 'Finished' && booking.booking_status !== 'Cancelled' && (
              <>
                <button className="booking-resched-btn" onClick={() => setShowReschedModal(true)}>Reschedule Booking</button>
                <button className="booking-delete-btn" onClick={handleCancel}>Cancel Booking</button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddTaskModal
        show={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={(newTask) => {
          setTasks(prev => [...prev, {
            id: newTask.task_id,
            task_name: newTask.title,
            status: newTask.status,
            deadline: newTask.due_date,
            assigned_to_name: newTask.assignee
              ? `${toTitleCase(newTask.assignee.role)} ${newTask.assignee.first_name}`
              : 'Unassigned',
            booking_ref: 'Task-' + newTask.task_id
          }]);
        }}
        bookingId={id}
        creatorId={user.id}
        staffOptions={availableStaff}
        isAdmin={isAdmin}
        currentUserId={user.id}
      />
      <RequestChangesModal show={showRequestChangesModal} onClose={() => setShowRequestChangesModal(false)} onSave={fetchDetails} bookingId={id} isClient={isClient} seeRequests={seeRequests} />
      <FeedbackModal show={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} onSave={fetchDetails} bookingId={id} isClient={isClient} />
      
      {isAdmin && (
        <>
          <AddBookingItemModal show={showAddItemModal} onClose={() => setShowAddItemModal(false)} onSave={fetchDetails} bookingId={id} />
          <AddPaymentModal show={showAddPaymentModal} onClose={() => setShowAddPaymentModal(false)} onSave={fetchDetails} bookingId={id} remainingBalance={(parseFloat(booking.final_amount) - parseFloat(booking.amount_paid))} />
          <AddExtraChargeModal show={showAddChargeModal} onClose={() => setShowAddChargeModal(false)} onSave={fetchDetails} bookingId={id} />
          <RescheduleModal show={showReschedModal} onClose={() => setShowReschedModal(false)} onSave={fetchDetails} bookingId={id} isAdmin={isAdmin} />
        </>
      )}

      {(isClient || isAdmin) && (
        <>
          <Invoice show={showInvoice} onClose={() => setShowInvoice(false)} selectedPayment={selectedPayment}/>
          <ExtraChargesModal show={showChargesModal} onClose={() => setShowChargesModal(false)} onSave={fetchDetails} bookingId={id} />
        </>
      )}
    </div>
  );
}

export default BookingDetails;
