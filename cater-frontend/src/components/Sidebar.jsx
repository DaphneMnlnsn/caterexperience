import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/logo.png';
import { FaCalendarAlt, FaUser, FaMoneyCheckAlt, FaUtensils, FaBox, FaWarehouse, FaUsersCog, FaClipboardList, FaSignOutAlt, FaHome, FaMapMarkedAlt } from 'react-icons/fa';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };
    return (
    <aside className="sidebar">
        <img src={logo} alt="Ollinati Catering Logo" className="logo-sidebar" />
        <nav>
        <ul>
            <li className="section-header">Main</li>
            <li className={location.pathname === '/admin' ? 'active' : ''}><FaHome /> Dashboard</li>
            <li className={location.pathname === '/bookings' ? 'active' : ''}><FaCalendarAlt /> Event Bookings</li>
            <li className={location.pathname === '/clients' ? 'active' : ''}><FaUser /> Clients</li>
            <li className={location.pathname === '/payment' ? 'active' : ''}><FaMoneyCheckAlt /> Payment Records</li>

            <li className="section-header">Management</li>
            <li className={location.pathname === '/menu' ? 'active' : ''}><FaUtensils /> Menu</li>
            <li className={location.pathname === '/package' ? 'active' : ''}><FaBox /> Packages</li>
            <li className={location.pathname === '/setup' ? 'active' : ''}><FaMapMarkedAlt /> Venue Setups</li>
            <li className={location.pathname === '/inventory' ? 'active' : ''}><FaWarehouse /> Inventory</li>
            <li className={location.pathname === '/staff' ? 'active' : ''}><FaUsersCog /> Staff Management</li>

            <li className="section-header">System</li>
            <li className={location.pathname === '/audit' ? 'active' : ''}><FaClipboardList /> Audit Log</li>
            <li onClick={handleLogout}><FaSignOutAlt /> Log Out</li>
        </ul>
        </nav>
    </aside>
    );
} 