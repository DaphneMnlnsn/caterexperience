import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AddBooking.css';
import Sidebar from '../../components/Sidebar';
import AddUserModal from '../../components/AddUserModal';
import { FaBell } from 'react-icons/fa';

function AddBooking() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const location = useLocation();
    const [customers, setCustomers] = useState([]);
    const [custSearchTerm, setCustSearchTerm] = useState('');
    const [custResults, setCustResults] = useState([]);
    const [customerPicked, setCustomerPicked] = useState(false);

    const [bookingData, setBookingData] = useState([]);
    const [form, setForm] = useState({
        firstName: '', middleName: '', lastName: '', email: '', address: '', contact: '',
        eventName: '', eventType: '', eventDate: location.state?.eventDate || '', eventLocation: '', eventStart: '', eventEnd: '',
        celebrantName: '', ageYear: '', guardName: '',
        package: '', motif: '', addons: '',
        beef: '', pork: '', chicken: '', vegetables: '', pastaFish: '', dessert: '',
        downpayment: '', totalPrice: '', specialRequests: '', freebies: '',
        stylist: '', cook: '', headWaiter1: '', headWaiter2: '',
        customLocation: '',
        agree: false,
    });

    const [customerType, setCustomerType] = useState('Add New Customer');
    const [showAddUser, setShowAddUser] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8000/api/bookings')
        .then(res => res.json())
        .then(data => setBookingData(data.bookings))
        .catch(err => console.error('Failed to fetch bookings:', err));

        fetch('http://localhost:8000/api/customers')
        .then(res => res.json())
        .then(data => setCustomers(data.customers))
        .catch(err => console.error('Failed to fetch customers:', err));
    }, []);

    const handleCustomerSearch = e => {
        const q = e.target.value.toLowerCase();
        setCustSearchTerm(q);

        if (!q.trim()) {
            setCustomerPicked(false);
            setCustResults([]);
            return;
        }

        const matches = customers.filter(raw => {
            const first = raw.first_name ?? raw.customer_firstname ?? '';
            const last  = raw.last_name  ?? raw.customer_lastname   ?? '';
            const email = raw.email      ?? raw.customer_email      ?? '';
            const full  = `${first} ${last}`.toLowerCase();

            return full.includes(q) || email.toLowerCase().includes(q);
        });

        setCustResults(matches);
        };

        const pickCustomer = raw => {
        const first = raw.first_name ?? raw.customer_firstname ?? '';
        const middle= raw.middle_name ?? raw.customer_middlename ?? '';
        const last  = raw.last_name  ?? raw.customer_lastname   ?? '';
        const email = raw.email      ?? raw.customer_email      ?? '';
        const addr  = raw.address    ?? raw.customer_address    ?? '';
        const phone = raw.phone      ?? raw.customer_phone      ?? '';

        setForm(f => ({
            ...f,
            firstName: first,
            middleName: middle,
            lastName: last,
            email: email,
            address: addr,
            contact: phone,
        }));
        setCustSearchTerm('');
        setCustResults([]);
        setCustomerPicked(true);
    };

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

        <div className="main-content">
            <header className="topbar">
            <div className="topbar-left"></div>
            <div className="topbar-right">
                <span className="user-name">
                {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
                </span>
                <FaBell className="notif-icon" />
            </div>
            </header>

            <section className="bookings-bottom">
            <div className="booking-form-card">

                {/* Header + dropdown */}
                <div className="booking-form-header">
                <h3 className="booking-form-title">Add New Event Booking</h3>
                </div>

                {/* Customer Details */}
                <div className="booking-section">
                <h3 className="booking-form-section-title">Customer Details</h3>
                <hr className="booking-section-divider" />
                <div className="search-box-customer">
                    <input
                    type="text"
                    placeholder="🔍 Search customer by name or email..."
                    value={custSearchTerm}
                    onChange={handleCustomerSearch}
                    />
                    {custResults.length > 0 && (
                    <ul className="search-results">
                        {custResults.map(c => (
                        <li key={c.customer_id} onClick={() => pickCustomer(c)}>
                            {c.customer_firstname} {c.customer_middlename || ''} {c.customer_lastname} — {c.customer_email}
                        </li>
                        ))}
                    </ul>
                    )}
                </div>
                <div className="booking-grid booking-grid-3">
                    <div className="booking-field-group">
                    <label htmlFor="firstName" className="booking-field-label">First Name</label>
                    <input
                        id="firstName"
                        name="firstName"
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={handleChange}
                        disabled={customerPicked}
                    />
                    </div>
                    <div className="booking-field-group">
                    <label htmlFor="middleName" className="booking-field-label">Middle Name</label>
                    <input
                        id="middleName"
                        name="middleName"
                        placeholder="Middle Name"
                        value={form.middleName}
                        onChange={handleChange}
                        disabled={customerPicked}
                    />
                    </div>
                    <div className="booking-field-group">
                    <label htmlFor="lastName" className="booking-field-label">Last Name</label>
                    <input
                        id="lastName"
                        name="lastName"
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={handleChange}
                        disabled={customerPicked}
                    />
                    </div>
                    <div className="booking-field-group" style={{ gridColumn: '1 / span 2' }}>
                    <label htmlFor="email" className="booking-field-label">Email Address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                        disabled={customerPicked}
                    />
                    </div>
                    <div className="booking-field-group">
                    <label htmlFor="contact" className="booking-field-label">Contact Number</label>
                    <input
                        id="contact"
                        name="contact"
                        placeholder="Phone"
                        value={form.contact}
                        onChange={handleChange}
                        disabled={customerPicked}
                    />
                    </div>
                    <div className="booking-field-group" style={{ gridColumn: '1/4' }}>
                    <label htmlFor="address" className="booking-field-label">Address</label>
                    <input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="Address"
                        value={form.address}
                        onChange={handleChange}
                        disabled={customerPicked}
                    />
                    </div>
                </div>
                </div>

                {/* Event Details */}
                <div className="booking-section">
                    <h3 className="booking-form-section-title">Event Details</h3>
                    <hr className="booking-section-divider" />
                    <div className="booking-grid booking-grid-3">

                        <div className="booking-field-group">
                            <label htmlFor="eventName" className="booking-field-label">Event Name</label>
                            <input
                                id="eventName"
                                name="eventName"
                                placeholder="Name"
                                value={form.eventName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="booking-field-group">
                            <label htmlFor="eventType" className="booking-field-label">Event Type</label>
                            <select
                                id="eventType"
                                name="eventType"
                                value={form.eventType}
                                onChange={handleChange}
                            >
                                <option value="">Type</option>
                                <option value="Birthday">Birthday</option>
                                <option value="Wedding">Wedding</option>
                                <option value="Corporate">Corporate</option>
                            </select>
                        </div>

                        <div className="booking-field-group">
                            <label htmlFor="eventDate" className="booking-field-label">Event Date</label>
                            <input
                                id="eventDate"
                                name="eventDate"
                                type="date"
                                value={form.eventDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="booking-field-group">
                            <label htmlFor="eventLocation" className="booking-field-label">Event Location</label>
                            <select
                                id="eventLocation"
                                name="eventLocation"
                                value={form.eventLocation}
                                onChange={handleChange}
                            >
                                <option value="">Select Venue</option>
                                <option value="Venue 1">Venue 1</option>
                                <option value="Venue 2">Venue 2</option>
                                <option value="outside">Outside Location</option>
                            </select>
                        </div>

                        {form.eventLocation === 'outside' && (
                            <div className="booking-field-group address-field" style={{ gridColumn: '1 / span 3' }}>
                                <label htmlFor="customLocation" className="booking-field-label">
                                Enter Address
                                </label>
                                <input
                                id="customLocation"
                                name="customLocation"
                                type="text"
                                placeholder="Type full address here"
                                value={form.customLocation}
                                onChange={handleChange}
                                />
                            </div>
                        )}

                        <div className="booking-field-group">
                            <label htmlFor="eventStart" className="booking-field-label">Event Start</label>
                            <input
                                id="eventStart"
                                name="eventStart"
                                type="time"
                                value={form.eventStart}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="booking-field-group">
                            <label htmlFor="eventEnd" className="booking-field-label">Event End</label>
                            <input
                                id="eventEnd"
                                name="eventEnd"
                                type="time"
                                value={form.eventEnd}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="booking-field-group">
                            <label htmlFor="celebrantName" className="booking-field-label">Celebrant Name</label>
                            <input
                                id="celebrantName"
                                name="celebrantName"
                                placeholder="Name"
                                value={form.celebrantName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="booking-field-group">
                            <label htmlFor="ageYear" className="booking-field-label">Age/Year</label>
                            <input
                                id="ageYear"
                                name="ageYear"
                                placeholder="e.g. 25"
                                value={form.ageYear}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="booking-field-group">
                            <label htmlFor="guardName" className="booking-field-label">Name of Guard/Bantay</label>
                            <input
                                id="guardName"
                                name="guardName"
                                placeholder="Guard Name"
                                value={form.guardName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="booking-field-group" style={{ gridColumn: '1 / span 3' }}>
                            <label htmlFor="specialRequests" className="booking-field-label">Special Requests</label>
                            <input
                                id="specialRequests"
                                name="specialRequests"
                                placeholder="e.g. vegetarian options, no peanuts"
                                value={form.specialRequests}
                                onChange={handleChange}
                            />
                        </div>

                    </div>
                </div>

                {/* Package Details */}
                <div className="booking-section">
                <h3 className="booking-form-section-title">Package Details</h3>
                <hr className="booking-section-divider" />
                <div className="booking-grid booking-grid-2">

                    <div className="booking-field-group">
                    <label htmlFor="package" className="booking-field-label">Package</label>
                    <select
                        id="package"
                        name="package"
                        value={form.package}
                        onChange={handleChange}
                    >
                        <option value="">Select Package</option>
                        <option value="Basic">Basic</option>
                        <option value="Premium">Premium</option>
                    </select>
                    </div>

                    <div className="booking-field-group">
                    <label htmlFor="motif" className="booking-field-label">Motif/Theme</label>
                    <select
                        id="motif"
                        name="motif"
                        value={form.motif}
                        onChange={handleChange}
                    >
                        <option value="">Select Theme</option>
                        <option value="Classic">Classic</option>
                        <option value="Modern">Modern</option>
                    </select>
                    </div>

                    <div className="booking-field-group" style={{ gridColumn: '1 / span 2' }}>
                    <label htmlFor="addons" className="booking-field-label">Addons</label>
                    <select
                        id="addons"
                        name="addons"
                        value={form.addons}
                        onChange={handleChange}
                    >
                        <option value="">Select Addon</option>
                        <option value="Photo Booth">Photo Booth</option>
                        <option value="Sound System">Sound System</option>
                    </select>
                    </div>

                </div>
                </div>

                {/* Menu Details */}
                <div className="booking-section">
                <h3 className="booking-form-section-title">Menu Details</h3>
                <hr className="booking-section-divider" />
                <div className="booking-grid booking-grid-2">

                    <div className="booking-field-group">
                    <label htmlFor="beef" className="booking-field-label">Beef</label>
                    <select
                        id="beef"
                        name="beef"
                        value={form.beef}
                        onChange={handleChange}
                    >
                        <option value="">Select Beef Dish</option>
                        <option value="Roast Beef">Roast Beef</option>
                        <option value="Beef Caldereta">Beef Caldereta</option>
                    </select>
                    </div>

                    <div className="booking-field-group">
                    <label htmlFor="pork" className="booking-field-label">Pork</label>
                    <select
                        id="pork"
                        name="pork"
                        value={form.pork}
                        onChange={handleChange}
                    >
                        <option value="">Select Pork Dish</option>
                        <option value="Lechon">Lechon</option>
                        <option value="Pork BBQ">Pork BBQ</option>
                    </select>
                    </div>

                    <div className="booking-field-group">
                    <label htmlFor="chicken" className="booking-field-label">Chicken</label>
                    <select
                        id="chicken"
                        name="chicken"
                        value={form.chicken}
                        onChange={handleChange}
                    >
                        <option value="">Select Chicken Dish</option>
                        <option value="Fried Chicken">Fried Chicken</option>
                        <option value="Chicken Curry">Chicken Curry</option>
                    </select>
                    </div>

                    <div className="booking-field-group">
                    <label htmlFor="vegetables" className="booking-field-label">Vegetables</label>
                    <select
                        id="vegetables"
                        name="vegetables"
                        value={form.vegetables}
                        onChange={handleChange}
                    >
                        <option value="">Select Veg Dish</option>
                        <option value="Chopsuey">Chopsuey</option>
                        <option value="Pinakbet">Pinakbet</option>
                    </select>
                    </div>

                    <div className="booking-field-group">
                    <label htmlFor="pastaFish" className="booking-field-label">Pasta/Fish</label>
                    <select
                        id="pastaFish"
                        name="pastaFish"
                        value={form.pastaFish}
                        onChange={handleChange}
                    >
                        <option value="">Select Pasta/Fish</option>
                        <option value="Spaghetti">Spaghetti</option>
                        <option value="Fish Fillet">Fish Fillet</option>
                    </select>
                    </div>

                    <div className="booking-field-group">
                    <label htmlFor="dessert" className="booking-field-label">Dessert</label>
                    <select
                        id="dessert"
                        name="dessert"
                        value={form.dessert}
                        onChange={handleChange}
                    >
                        <option value="">Select Dessert</option>
                        <option value="Leche Flan">Leche Flan</option>
                        <option value="Fruit Salad">Fruit Salad</option>
                    </select>
                    </div>

                </div>
                </div>

                {/* Payment Details */}
                <div className="booking-section">
                <h3 className="booking-form-section-title">Payment Details</h3>
                <hr className="booking-section-divider" />
                <div className="booking-grid booking-grid-2">

                    <div className="booking-field-group">
                    <label htmlFor="downpayment" className="booking-field-label">Downpayment Amount</label>
                    <input
                        id="downpayment"
                        name="downpayment"
                        type="number"
                        placeholder="e.g. 1000"
                        value={form.downpayment}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="booking-field-group">
                    <label htmlFor="totalPrice" className="booking-field-label">Total Price</label>
                    <input
                        id="totalPrice"
                        name="totalPrice"
                        type="number"
                        placeholder="e.g. 5000"
                        value={form.totalPrice}
                        onChange={handleChange}
                    />
                    </div>

                    <div className="booking-field-group" style={{ gridColumn: '1 / span 2' }}>
                    <label htmlFor="freebies" className="booking-field-label">Freebies</label>
                    <input
                        id="freebies"
                        name="freebies"
                        placeholder="Free Items"
                        value={form.freebies}
                        onChange={handleChange}
                    />
                    </div>

                </div>
                </div>

                {/* Staff Assignment */}
                <div className="booking-section">
                <h3 className="booking-form-section-title">Staff Assignment</h3>
                <hr className="booking-section-divider" />
                <div className="booking-grid booking-grid-2">

                    <div className="booking-field-group">
                    <label htmlFor="stylist" className="booking-field-label">Stylist</label>
                    <select
                        id="stylist"
                        name="stylist"
                        value={form.stylist}
                        onChange={handleChange}
                    >
                        <option value="">Select Stylist</option>
                        <option value="Stylist 1">Stylist 1</option>
                        <option value="Stylist 2">Stylist 2</option>
                    </select>
                    </div>

                    <div className="booking-field-group">
                    <label htmlFor="headWaiter1" className="booking-field-label">Head Waiter 1</label>
                    <select
                        id="headWaiter1"
                        name="headWaiter1"
                        value={form.headWaiter1}
                        onChange={handleChange}
                    >
                        <option value="">Select Waiter</option>
                        <option value="Waiter 1">Waiter 1</option>
                        <option value="Waiter 2">Waiter 2</option>
                    </select>
                    </div>

                    <div className="booking-field-group">
                    <label htmlFor="cook" className="booking-field-label">Cook</label>
                    <select
                        id="cook"
                        name="cook"
                        value={form.cook}
                        onChange={handleChange}
                    >
                        <option value="">Select Cook</option>
                        <option value="Cook 1">Cook 1</option>
                        <option value="Cook 2">Cook 2</option>
                    </select>
                    </div>

                    <div className="booking-field-group">
                    <label htmlFor="headWaiter2" className="booking-field-label">Head Waiter 2</label>
                    <select
                        id="headWaiter2"
                        name="headWaiter2"
                        value={form.headWaiter2}
                        onChange={handleChange}
                    >
                        <option value="">Select Waiter</option>
                        <option value="Waiter 3">Waiter 3</option>
                        <option value="Waiter 4">Waiter 4</option>
                    </select>
                    </div>

                </div>
                </div>

                {/* Terms & Conditions */}
                <div className="booking-form-row checkbox-row">
                <input
                    type="checkbox"
                    name="agree"
                    checked={form.agree}
                    onChange={handleChange}
                />
                <span>
                    As a client, I have read and agree to the Terms and Conditions within the contract.
                </span>
                </div>

                {/* Buttons */}
                <div className="button-row">
                <button className="submit-btn" type="submit">Schedule Booking</button>
                <button className="cancel-btn" type="button" onClick={() => navigate(-1)}>Cancel</button>
                </div>

            </div>
            </section>
        </div>
        </div>
    );
}

export default AddBooking;
