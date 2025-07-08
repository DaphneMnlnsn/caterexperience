import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AddBooking.css';
import Swal from 'sweetalert2';
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
    const [packages, setPackages] = useState([]);
    const [themes, setThemes] = useState([]);
    const [addons, setAddons] = useState([]);
    const [foods, setFoods] = useState([]);
    const [staff, setStaff] = useState([]);
    const [availabilityStatus, setAvailabilityStatus] = useState(null);

    const [bookingData, setBookingData] = useState([]);
    const [form, setForm] = useState({
        firstName: '', middleName: '', lastName: '', email: '', address: '', contact: '',
        eventName: '', eventType: '', eventDate: location.state?.eventDate || '', eventLocation: '', eventStart: '', eventEnd: '',
        celebrantName: '', ageYear: '', watcher: '', pax: '', waiters: '',
        package: '', motif: '', addons: '',
        beef: '', pork: '', chicken: '', vegetables: '', pastaFish: '', dessert: '',
        downpayment: '', totalPrice: '', specialRequests: '', freebies: '',
        stylist: '', cook: '', headWaiter1: '', headWaiter2: '',
        customLocation: '',
        agree: false,
    });

    const handleStartChange = (e) => {
        const value = e.target.value;
        const start = new Date(`2000-01-01T${value}`);
        
        const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
        const formattedEnd = end.toTimeString().slice(0, 5);

        setForm(prev => ({
            ...prev,
            eventStart: value,
            eventEnd: formattedEnd
        }));
    };


    useEffect(() => {
        fetch('http://localhost:8000/api/bookings')
        .then(res => res.json())
        .then(data => setBookingData(data.bookings))
        .catch(err => console.error('Failed to fetch bookings:', err));

        fetch('http://localhost:8000/api/customers')
        .then(res => res.json())
        .then(data => setCustomers(data.customers))
        .catch(err => console.error('Failed to fetch customers:', err));

        fetch('http://localhost:8000/api/packages')
        .then(res => res.json())
        .then(data => setPackages(data.packages))
        .catch(err => console.error('Failed to fetch packages:', err));

        fetch('http://localhost:8000/api/themes')
        .then(res => res.json())
        .then(data => setThemes(data.themes))
        .catch(err => console.error('Failed to fetch themes:', err));

        fetch('http://localhost:8000/api/addons')
        .then(res => res.json())
        .then(data => setAddons(data.addons))
        .catch(err => console.error('Failed to fetch addons:', err));

        fetch('http://localhost:8000/api/foods')
        .then(res => res.json())
        .then(data => setFoods(data.foods))
        .catch(err => console.error('Failed to fetch foods:', err));

        fetch('http://localhost:8000/api/users')
        .then(res => res.json())
        .then(data => setStaff(data.users))
        .catch(err => console.error('Failed to fetch users:', err));
    }, []);

    useEffect(() => {
        const checkAvailability = async () => {
            if (!form.eventDate || !form.eventStart || !form.eventEnd) {
            setAvailabilityStatus(null);
            return;
            }

            const start = new Date(`2000-01-01T${form.eventStart}`);
            const end = new Date(`2000-01-01T${form.eventEnd}`);
            if (end <= start || (end - start) / (1000 * 60 * 60) < 4) {
            setAvailabilityStatus(null);
            return;
            }

            try {
            const res = await fetch(`http://localhost:8000/api/bookings/check-availability?event_date=${form.eventDate}&event_start_time=${form.eventStart}&event_end_time=${form.eventEnd}`);
            const data = await res.json();
            setAvailabilityStatus(data.available ? 'available' : 'conflict');
            } catch (err) {
            console.error('Check failed:', err);
            setAvailabilityStatus('error');
            }
        };

        checkAvailability();
    }, [form.eventDate, form.eventStart, form.eventEnd]);

    useEffect(() => {
        const start = form.eventStart ? new Date(`2000-01-01T${form.eventStart}`) : null;
        const end = form.eventEnd ? new Date(`2000-01-01T${form.eventEnd}`) : null;

        if (start && end) {
            const diffHours = (end - start) / (1000 * 60 * 60);

            if (end <= start) {
            setAvailabilityStatus('error-start-end');
            } else if (diffHours < 4) {
            setAvailabilityStatus('error-duration');
            }
        }
    }, [form.eventStart, form.eventEnd]);


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

    const validateForm = () => {
        const requiredFields = [
            'firstName', 'lastName', 'email', 'contact', 'address',
            'eventName', 'eventDate', 'eventStart', 'eventEnd', 'eventLocation',
            'package', 'motif', 'pax', 'watcher', 'waiters', 'totalPrice'
        ];

        const missing = requiredFields.filter(field => !form[field] || form[field].trim() === '');

        if (form.eventLocation === 'outside' && !form.customLocation.trim()) {
            missing.push('customLocation');
        }

        if (missing.length > 0) {
            Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: `Please complete the following fields: ${missing.join(', ')}`,
            });
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            Swal.fire({
            icon: 'warning',
            title: 'Invalid Email',
            text: 'Please enter a valid email address.',
            });
            return false;
        }

        if (isNaN(form.pax) || parseInt(form.pax) <= 0) {
            Swal.fire({
            icon: 'warning',
            title: 'Invalid Pax',
            text: 'Pax must be a positive number.',
            });
            return false;
        }

        if (isNaN(form.totalPrice) || parseFloat(form.totalPrice) <= 0) {
            Swal.fire({
            icon: 'warning',
            title: 'Invalid Total Price',
            text: 'Total price must be a positive number.',
            });
            return false;
        }

        if (!form.agree) {
            Swal.fire({
            icon: 'warning',
            title: 'Terms Not Agreed',
            text: 'You must agree to the Terms and Conditions.',
            });
            return false;
        }

        return true;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const assignedUserIds = [];

        if (form.stylist) assignedUserIds.push(parseInt(form.stylist));
        if (form.cook) assignedUserIds.push(parseInt(form.cook));
        if (form.headWaiter1) assignedUserIds.push(parseInt(form.headWaiter1));
        if (form.headWaiter2) assignedUserIds.push(parseInt(form.headWaiter2));

        const foodIds = [
            form.beef, form.pork, form.chicken,
            form.vegetables, form.pastaFish, form.dessert,
        ].filter(id => id !== '').map(id => parseInt(id));

        const payload = {
            event_name: form.eventName,
            event_type: form.eventType,
            event_date: form.eventDate,
            event_start_time: form.eventStart,
            event_end_time: form.eventEnd,
            event_location: form.eventLocation === 'outside' ? form.customLocation : form.eventLocation,
            celebrant_name: form.celebrantName,
            age: form.ageYear ? parseInt(form.ageYear) : null,
            watcher: form.watcher,
            waiter_count: parseInt(form.waiters),
            pax: parseInt(form.pax),
            package_id: parseInt(form.package),
            theme_id: parseInt(form.motif),
            food_ids: foodIds,
            event_total_price: parseFloat(form.totalPrice),
            price_breakdown: {
                package: form.package,
                addons: form.addons,
            },
            freebies: form.freebies,
            special_request: form.specialRequests,
            customer_email: form.email,
            customer_firstname: form.firstName,
            customer_lastname: form.lastName,
            customer_middlename: form.middleName,
            customer_phone: form.contact,
            customer_address: form.address,
            assigned_user_ids: assignedUserIds,
            created_by: user.id,
            downpayment: parseFloat(form.downpayment),
        };

        if (form.eventStart && form.eventEnd) {
            const start = new Date(`2000-01-01T${form.eventStart}`);
            const end = new Date(`2000-01-01T${form.eventEnd}`);
            const diffHours = (end - start) / (1000 * 60 * 60);

            if (end <= start) {
                Swal.fire('Error', 'End time must be after start time.', 'error');
                return;
            }

            if (diffHours < 4) {
                Swal.fire('Error', 'Event duration must be at least 4 hours.', 'error');
                return;
            }

            if (availabilityStatus === 'conflict') {
                Swal.fire('Error', 'Selected time overlaps with another event.', 'error');
                return;
            }
        }

        try {
            const res = await fetch('http://localhost:8000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (res.ok) {
                Swal.fire('Saved!', 'Event successfully booked.', 'success');
                navigate('/admin/bookings');
            } else {
                console.error('Error:', result);
                Swal.fire('Error', 'There was a problem saving the event booking.', 'error');
            }
        } catch (err) {
            console.error('Submit error:', err);
            Swal.fire('Error', 'There was a problem saving the event booking.', 'error');
        }
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
                                <option value="Airconditioned Room">Airconditioned Room</option>
                                <option value="Pavilion">Pavilion</option>
                                <option value="Pool">Pool</option>
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
                                min="05:00"
                                value={form.eventStart}
                                onChange={handleStartChange}
                            />
                            {availabilityStatus === 'available' && (
                                <div className="availability available">✅ Time slot is available</div>
                            )}
                            {availabilityStatus === 'conflict' && (
                                <div className="availability conflict">❌ Time slot is unavailable or overlaps another event</div>
                            )}
                            {availabilityStatus === 'error' && (
                                <div className="availability error">⚠️ Failed to check availability</div>
                            )}
                            {availabilityStatus === 'error-start-end' && (
                                <div className="availability conflict">❌ End time must be after start time</div>
                            )}
                            {availabilityStatus === 'error-duration' && (
                                <div className="availability conflict">❌ Minimum event duration is 4 hours</div>
                            )}
                        </div>

                        <div className="booking-field-group">
                            <label htmlFor="eventEnd" className="booking-field-label">Event End</label>
                            <input
                                id="eventEnd"
                                name="eventEnd"
                                type="time"
                                value={form.eventEnd}
                                onChange={handleChange}
                                min={form.eventStart}
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
                            <label htmlFor="watcher" className="booking-field-label">Name of Watcher/Bantay</label>
                            <input
                                id="watcher"
                                name="watcher"
                                placeholder="Watcher Name"
                                value={form.watcher}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="booking-field-group">
                            <label htmlFor="specialRequests" className="booking-field-label">Special Requests</label>
                            <input
                                id="specialRequests"
                                name="specialRequests"
                                placeholder="e.g. vegetarian options, no peanuts"
                                value={form.specialRequests}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="booking-field-group">
                            <label htmlFor="pax" className="booking-field-label">Number of Pax</label>
                            <input
                                id="pax"
                                name="pax"
                                placeholder="e.g. 25"
                                value={form.pax}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="booking-field-group">
                            <label htmlFor="waiters" className="booking-field-label">Number of Waiters</label>
                            <input
                                id="waiters"
                                name="waiters"
                                placeholder="e.g. 5"
                                value={form.waiters}
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
                        {packages.map(pkg => (
                            <option key={pkg.package_id} value={pkg.package_id}>
                            {pkg.package_name}
                            </option>
                        ))}
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
                        {themes.map(theme => (
                            <option key={theme.theme_id} value={theme.theme_id}>
                            {theme.theme_name}
                            </option>
                        ))}
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
                        {addons.map(addon => (
                            <option key={addon.addon_id} value={addon.addon_id}>
                            {addon.addon_name}
                            </option>
                        ))}
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
                        {foods
                        .filter(f => f.food_type === 'Beef')
                        .map(beef => (
                            <option key={beef.food_id} value={beef.food_id}>
                                {beef.food_name}
                            </option>
                        ))}
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
                        {foods
                        .filter(f => f.food_type === 'Pork')
                        .map(pork => (
                            <option key={pork.food_id} value={pork.food_id}>
                                {pork.food_name}
                            </option>
                        ))}
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
                        {foods
                        .filter(f => f.food_type === 'Chicken')
                        .map(chicken => (
                            <option key={chicken.food_id} value={chicken.food_id}>
                                {chicken.food_name}
                            </option>
                        ))}
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
                        {foods
                        .filter(f => f.food_type === 'Vegetables')
                        .map(veg => (
                            <option key={veg.food_id} value={veg.food_id}>
                                {veg.food_name}
                            </option>
                        ))}
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
                        {foods
                        .filter(f => f.food_type === 'Pasta or Fish')
                        .map(pf => (
                            <option key={pf.food_id} value={pf.food_id}>
                                {pf.food_name}
                            </option>
                        ))}
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
                        {foods
                        .filter(f => f.food_type === 'Dessert')
                        .map(dessert => (
                            <option key={dessert.food_id} value={dessert.food_id}>
                                {dessert.food_name}
                            </option>
                        ))}
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
                        {staff
                        .filter(s => s.role === 'stylist')
                        .map(stylist => (
                            <option key={stylist.id} value={stylist.id}>
                                {stylist.first_name}{stylist.middle_name ? stylist.middle_name + ' ' : ''} {stylist.last_name}
                            </option>
                        ))}
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
                        {staff
                        .filter(s => s.role === 'head waiter' && s.id !== parseInt(form.headWaiter2))
                        .map(waiter => (
                            <option key={waiter.id} value={waiter.id}>
                                {waiter.first_name}{waiter.middle_name ? waiter.middle_name + ' ' : ''} {waiter.last_name}
                            </option>
                        ))}
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
                        {staff
                        .filter(s => s.role === 'cook')
                        .map(cook => (
                            <option key={cook.id} value={cook.id}>
                                {cook.first_name} {cook.middle_name ? cook.middle_name + ' ' : ''}{cook.last_name}
                            </option>
                        ))}
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
                        {staff
                        .filter(s => s.role === 'head waiter' && s.id !== parseInt(form.headWaiter1))
                        .map(waiter => (
                            <option key={waiter.id} value={waiter.id}>
                                {waiter.first_name}{waiter.middle_name ? waiter.middle_name + ' ' : ''} {waiter.last_name}
                            </option>
                        ))}
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
                <button className="submit-btn" type="submit" onClick={handleSubmit}>Schedule Booking</button>
                <button className="cancel-btn" type="button" onClick={() => navigate(-1)}>Cancel</button>
                </div>

            </div>
            </section>
        </div>
        </div>
    );
}

export default AddBooking;
