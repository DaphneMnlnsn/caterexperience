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

            <li className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
                <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaHome /> Dashboard
                </NavLink>
            </li>

            <li className={location.pathname === '/admin/bookings' ? 'active' : ''}>
                <NavLink to="/admin/bookings" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaCalendarAlt /> Event Bookings
                </NavLink>
            </li>
            
            <li className={location.pathname === '/admin/clients' ? 'active' : ''}>
                <NavLink to="/admin/clients" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaUser /> Clients
                </NavLink>
            </li>
            
            <li className={location.pathname === '/admin/payments' ? 'active' : ''}>
                <NavLink to="/admin/payments" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaMoneyCheckAlt /> Payment Records
                </NavLink>
            </li>
        
            <li className="section-header">Management</li>
            <li className={location.pathname === '/admin/menu' ? 'active' : ''}>
                <NavLink to="/admin/menu" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaUtensils /> Menu
                </NavLink>
            </li>
            
            <li className={location.pathname === '/admin/package' ? 'active' : ''}>
                <NavLink to="/admin/package" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaBox /> Packages
                </NavLink>
            </li>

            <li className={location.pathname === '/admin/setup' ? 'active' : ''}>
                <NavLink to="/admin/setup" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaMapMarkedAlt /> Venue Setups
                </NavLink>
            </li>
            
            <li className={location.pathname === '/admin/inventory' ? 'active' : ''}>
                <NavLink to="/admin/inventory" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaWarehouse /> Inventory
                </NavLink>
            </li>
            
            <li className={location.pathname === '/admin/users' ? 'active' : ''}>
                <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaUsersCog /> Staff Management
                </NavLink>
            </li>

            <li className="section-header">System</li>
            <li className={location.pathname === '/admin/audit' ? 'active' : ''}>
                <NavLink to="/admin/audit" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FaClipboardList /> Audit Log
                </NavLink>
            </li>
            
            <li onClick={handleLogout}><FaSignOutAlt /> Log Out</li>
        </ul>
        </nav>
    </aside>
    );
} 