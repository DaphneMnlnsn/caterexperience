import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AddBooking.css';
import Swal from 'sweetalert2';
import Sidebar from '../../components/Sidebar';
import TermsAndConditions from '../../components/TermsAndConditions';
import axiosClient from '../../axiosClient';
import { FaBell } from 'react-icons/fa';
import Header from '../../components/Header';

function AddBooking() {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
const user = storedUser ? JSON.parse(atob(storedUser)) : null;

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

    const [packageTiers, setPackageTiers] = useState([]);
    const [selectedPackageTier, setSelectedPackageTier] = useState(null);
    const [addonTiersMap, setAddonTiersMap] = useState({});
    const [selectedAddons, setSelectedAddons] = useState([]);

    const [totalAmount, setTotalAmount] = useState(0);
    const [showTerms, setShowTerms] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const [bookingData, setBookingData] = useState([]);
    const [form, setForm] = useState({
        firstName: '', middleName: '', lastName: '', email: '', address: '', contact: '',
        eventName: '', eventType: '', eventDate: location.state?.eventDate || '', eventLocation: '', eventStart: '', eventEnd: '',
        celebrantName: '', ageYear: '', watcher: '', pax: '', waiters: '',
        package: null, motif: '', addons: [],
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

    const getMinSelectableDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 8);
        return today.toISOString().split('T')[0];
    };

    useEffect(() => {
        axiosClient.get('/bookings')
        .then(res => setBookingData(res.data.bookings))
        .catch(err => console.error('Failed to fetch bookings:', err.response?.data || err.message));

        axiosClient.get('/customers')
        .then(res => setCustomers(res.data.customers))
        .catch(err => console.error('Failed to fetch customers:', err.response?.data || err.message));

        axiosClient.get('/packages')
        .then(res => setPackages(res.data.packages.filter(p => p.package_status === 'available')))
        .catch(err => console.error('Failed to fetch packages:', err.response?.data || err.message));

        axiosClient.get('/themes')
        .then(res => setThemes(res.data.themes.filter(t => t.theme_status === 'available')))
        .catch(err => console.error('Failed to fetch themes:', err.response?.data || err.message));

        axiosClient.get('/addons')
        .then(res => setAddons(res.data.addons.filter(a => a.addon_status === 'available')))
        .catch(err => console.error('Failed to fetch addons:', err.response?.data || err.message));

        axiosClient.get('/foods')
        .then(res => setFoods(res.data.foods.filter(f => f.food_status === 'available')))
        .catch(err => console.error('Failed to fetch foods:', err.response?.data || err.message));

        axiosClient.get('/users')
        .then(res => setStaff(res.data.users))
        .catch(err => console.error('Failed to fetch users:', err.response?.data || err.message));
    }, []);

    useEffect(() => {
        const checkAvailability = async () => {
            if (!form.eventDate || !form.eventStart || !form.eventEnd) {
            setAvailabilityStatus(null);
            return;
            }

            const start = new Date(`2000-01-01T${form.eventStart}`);
            let end = new Date(`2000-01-01T${form.eventEnd}`);

            if (end <= start) {
                end.setDate(end.getDate() + 1);
            }
            if (end <= start || (end - start) / (1000 * 60 * 60) < 4) {
            setAvailabilityStatus(null);
            return;
            }

            try {
                const res = await axiosClient.get('/bookings/check-availability', {
                    params: {
                    event_date: form.eventDate,
                    event_start_time: form.eventStart,
                    event_end_time: form.eventEnd,
                    }
                });

                setAvailabilityStatus(res.data.available ? 'available' : 'conflict');
            } catch (err) {
                console.error('Check failed:', err.response?.data || err.message);
                setAvailabilityStatus('error');
            }
        };

        checkAvailability();
    }, [form.eventDate, form.eventStart, form.eventEnd]);

    useEffect(() => {
        const start = form.eventStart ? new Date(`2000-01-01T${form.eventStart}`) : null;
        let end = form.eventEnd ? new Date(`2000-01-01T${form.eventEnd}`) : null;

        if (start && end) {
            if (end <= start) {
                end.setDate(end.getDate() + 1);
            }

            const diffHours = (end - start) / (1000 * 60 * 60);

            if (diffHours < 4) {
                setAvailabilityStatus('error-duration');
            } else {
                setAvailabilityStatus(null);
            }
        }

    }, [form.eventStart, form.eventEnd]);

    useEffect(() => {
        if (!form.package) {
            setPackageTiers([]);
            setSelectedPackageTier(null);
            return;
        }
        const pkg = packages.find(p => p.package_id === form.package);
        setPackageTiers(pkg?.price_tiers || []);
    }, [form.package, packages]);


    useEffect(() => {
        selectedAddons.forEach(({ addonId }) => {
            if (!addonTiersMap[addonId]) {
            const addon = addons.find(a => a.addon_id === addonId);
            setAddonTiersMap(prev => ({
                ...prev,
                [addonId]: addon?.prices || []
            }));
            }
        });
    }, [selectedAddons, addons]);

    useEffect(() => {
        let total = 0;
        if (selectedPackageTier) total += parseFloat(selectedPackageTier.price_amount);
        selectedAddons.forEach(({ tier, qty }) => {
            if (tier) total += parseFloat(tier.price * qty);
        });
        setTotalAmount(total);
    }, [selectedPackageTier, selectedAddons]);


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

    const handlePackageChange = e => {
        const pkgId = +e.target.value;
        setForm(f => ({ ...f, package: pkgId }));
        setSelectedPackageTier(null);
    };

    const addAddonRow = () => {
        setSelectedAddons(prev => [...prev, { addonId: null, tier: null, qty: 1 }]);
    };

    const updateAddonRow = (index, field, value) => {
        setSelectedAddons(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
    };

    const removeAddonRow = index => {
        setSelectedAddons(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const requiredFields = [
            'firstName', 'lastName', 'email', 'contact', 'address',
            'eventName', 'eventDate', 'eventStart', 'eventEnd', 'eventLocation',
            'package', 'motif', 'pax', 'watcher', 'waiters'
        ];

    const missing = requiredFields.filter(field => {
        const val = form[field];
        if (val === null || val === undefined) return true;
        if (typeof val === 'string') {
            return val.trim() === '';
        }
        if (Array.isArray(val)) {
            return val.length === 0;
        }
        return false;
    });

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

        return true;
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();
        setShowTerms(true);
    }

    const handleConfirmTerms = () => {
        if(!agreed) return;
        setShowTerms(false);
        handleSubmit();
    }

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

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
            package_price_id: selectedPackageTier.package_price_id,
            event_addons: selectedAddons.map(a => ({
                addon_id: a.addonId,
                addon_price_id: a.tier.addon_price_id,
                quantity: a.qty,
                total_price: parseFloat(a.tier.price) * a.qty,
            })),
            event_total_price: totalAmount,
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
            const res = await axiosClient.post('/bookings', payload);

            Swal.fire('Saved!', 'Event successfully booked.', 'success');
            navigate('/bookings');
        } catch (err) {
            console.error('Error:', err.response?.data || err.message);
            Swal.fire('Error', 'There was a problem saving the event booking.', 'error');
        }
    };

    return (
        <div className="page-container">
            <Sidebar />

        <div className="main-content">
            <Header user={user} />

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
                    {!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.email && (
                        <span className="error-text">Please enter a valid email.</span>
                    )}
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
                    {!/^\d{10,11}$/.test(form.contact) && form.contact && (
                        <span className="error-text">Phone must be 10–11 digits.</span>
                    )}
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
                                min={getMinSelectableDate()}
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
                                <option value="Poolside">Pool</option>
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
                            {form.eventStart && form.eventEnd && (() => {
                                const start = new Date(`2000-01-01T${form.eventStart}`);
                                const end = new Date(`2000-01-01T${form.eventEnd}`);
                                if (end <= start) {
                                    return <div className="availability note">🕛 Event ends the next day</div>;
                                }
                                return null;
                            })()}
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
                            {form.ageYear && isNaN(form.ageYear) && (
                                <span className="error-text">Age must be a number.</span>
                            )}
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
                            {(isNaN(form.pax) || parseInt(form.pax) <= 0) && form.pax && (
                                <span className="error-text">Enter a valid positive number.</span>
                            )}
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
                            {(isNaN(form.pax) || parseInt(form.pax) <= 0) && form.pax && (
                                <span className="error-text">Enter a valid positive number.</span>
                            )}
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
                            value={form.package || ''}
                            onChange={e => {
                            handlePackageChange(e);
                            setSelectedPackageTier(null);
                            }}
                        >
                            <option value="">Select Package</option>
                            {packages.map(pkg => (
                            <option key={pkg.package_id} value={pkg.package_id}>
                                {pkg.package_name}
                            </option>
                            ))}
                        </select>
                    </div>

                    {packageTiers.length > 0 && (
                    <div className="booking-field-group">
                        <label className="booking-field-label">Package Tier</label>
                        <select
                        value={selectedPackageTier?.package_price_id || ''}
                        onChange={e => {
                            const tier = packageTiers.find(t => t.package_price_id === +e.target.value);
                            setSelectedPackageTier(tier);
                        }}
                        >
                        <option value="">Choose Tier…</option>
                        {packageTiers.map(t => (
                            <option key={t.package_price_id} value={t.package_price_id}>
                            {t.price_label} – ₱{t.price_amount}
                            </option>
                        ))}
                        </select>
                    </div>
                    )}


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
                        <label className="booking-field-label">Addons</label>

                        {selectedAddons.map((row, idx) => (
                            <div key={idx} className="addon-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select
                                value={row.addonId || ''}
                                onChange={e => updateAddonRow(idx, 'addonId', +e.target.value)}
                            >
                                <option value="">Select Addon…</option>
                                {addons.map(a => (
                                <option key={a.addon_id} value={a.addon_id}>
                                    {a.addon_name}
                                </option>
                                ))}
                            </select>

                            {addonTiersMap[row.addonId]?.length > 0 && (
                                <select
                                value={row.tier?.addon_price_id || ''}
                                onChange={e => {
                                    const tier = addonTiersMap[row.addonId].find(t => t.addon_price_id === +e.target.value);
                                    updateAddonRow(idx, 'tier', tier);
                                }}
                                >
                                <option value="">Select Tier…</option>
                                {addonTiersMap[row.addonId].map(t => (
                                    <option key={t.addon_price_id} value={t.addon_price_id}>
                                    {t.description} – ₱{t.price}
                                    </option>
                                ))}
                                </select>
                            )}

                            <input
                                type="number"
                                min="1"
                                value={row.qty}
                                style={{ width: '3rem' }}
                                onChange={e => updateAddonRow(idx, 'qty', +e.target.value)}
                            />

                            <button type="button" className='close-btn' onClick={() => removeAddonRow(idx)}>
                                ×
                            </button>
                            </div>
                        ))}

                        <button type="button" onClick={addAddonRow} className='addon-btn'>
                            + Add Addon
                        </button>
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
                        <label htmlFor="downpayment" className="booking-field-label">
                            Downpayment/Reservation Amount
                        </label>
                        <input
                            id="downpayment"
                            name="downpayment"
                            type="number"
                            placeholder="e.g. 2000"
                            value={form.downpayment}
                            onChange={handleChange}
                        />
                        </div>
                        <div className="booking-field-group">
                        <label htmlFor="totalPrice" className="booking-field-label">
                            Total Price
                        </label>
                        <input
                            id="totalPrice"
                            name="totalPrice"
                            type="number"
                            value={totalAmount}
                            readOnly
                        />
                        </div>
                        <div className="booking-field-group" style={{ gridColumn: '1 / span 2' }}>
                        <label htmlFor="freebies" className="booking-field-label">
                            Freebies
                        </label>
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

                {/* Buttons */}
                <div className="button-row">
                <button className="submit-btn" type="submit" onClick={handlePreSubmit}>Schedule Booking</button>
                <button className="cancel-btn" type="button" onClick={() => navigate(-1)}>Cancel</button>
                </div>

            </div>
            </section>
        </div>
        <TermsAndConditions
            show={showTerms}
            agreed={agreed}
            onClose={() => setShowTerms(false)}
            onToggleAgree={(e) => setAgreed(e.target.checked)}
            onConfirm={handleConfirmTerms}
        />
        </div>
    );
}

export default AddBooking;
