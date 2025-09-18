import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/logo.png';
import { FaBars, FaTimes, FaCalendarAlt, FaUser, FaMoneyCheckAlt, FaUtensils, FaBox, FaWarehouse, FaUsersCog, FaClipboardList, FaSignOutAlt, FaHome, FaMapMarkedAlt } from 'react-icons/fa';
import axiosClient from '../axiosClient';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(atob(storedUser)) : null;
  const role = user?.role;

  const handleLogout = async () => {
    try {
      await axiosClient.post('/logout');
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.clear();
      navigate('/');
    }
  };

  const menuItems = [
    { section: "Main", to: "/admin/dashboard", label: "Dashboard", icon: <FaHome />, roles: ["admin"] },
    { section: "Main", to: "/stylist/dashboard", label: "Dashboard", icon: <FaHome />, roles: ["stylist"] },
    { section: "Main", to: "/cook/dashboard", label: "Dashboard", icon: <FaHome />, roles: ["cook"] },
    { section: "Main", to: "/waiter/dashboard", label: "Dashboard", icon: <FaHome />, roles: ["head waiter"] },
    { section: "Main", to: "/client/dashboard", label: "Dashboard", icon: <FaHome />, roles: ["client"] },
    { section: "Main", to: "/bookings", label: "Event Bookings", icon: <FaCalendarAlt />, roles: ["admin"] },
    { section: "Main", to: "/assigned/bookings", label: "Event Bookings", icon: <FaCalendarAlt />, roles: ["stylist", "head waiter", "cook", "client"] },
    { section: "Main", to: "/admin/clients", label: "Clients", icon: <FaUser />, roles: ["admin"] },
    { section: "Main", to: "/admin/payments", label: "Payment Records", icon: <FaMoneyCheckAlt />, roles: ["admin"] },
    { section: "Management", to: "/menu", label: "Menu", icon: <FaUtensils />, roles: ["admin", "cook", "client"] },
    { section: "Management", to: "/package", label: "Packages", icon: <FaBox />, roles: ["admin", "stylist", "client"] },
    { section: "Management", to: "/setup", label: "Venue Setups", icon: <FaMapMarkedAlt />, roles: ["admin", "stylist", "head waiter"] },
    { section: "Management", to: "/admin/inventory", label: "Inventory", icon: <FaWarehouse />, roles: ["admin"] },
    { section: "Management", to: "/admin/users", label: "Staff Management", icon: <FaUsersCog />, roles: ["admin"] },
    { section: "System", to: "/admin/audit", label: "Audit Log", icon: <FaClipboardList />, roles: ["admin"] },
    { section: "System", label: "Log Out", icon: <FaSignOutAlt />, roles: ["admin", "stylist", "cook", "head waiter", "client"], logout: true },
  ];

  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!item.roles.includes(role)) return acc;
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Hamburger toggle (visible only on mobile/tablet) */}
      <button 
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <img src={logo} alt="Ollinati Catering Logo" className="logo-sidebar" />
        <nav>
          <ul>
            {role === "admin" ? (
              Object.keys(groupedMenu).map(section => (
                <React.Fragment key={section}>
                  <li className="section-header-sidebar">{section}</li>
                  {groupedMenu[section].map(item => (
                    <li 
                      key={item.label} 
                      className={item.to && location.pathname === item.to ? "active" : ""}
                      onClick={() => {
                        if (item.logout) handleLogout();
                        if (isOpen) setIsOpen(false); // auto-close after click
                      }}
                    >
                      {item.to ? (
                        <NavLink to={item.to} className={({ isActive }) => (isActive ? "active" : "")}>
                          {item.icon} {item.label}
                        </NavLink>
                      ) : (
                        <span>{item.icon} {item.label}</span>
                      )}
                    </li>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <>
                <li className="section-header-sidebar">Main</li>
                {filteredMenu.map(item => (
                  <li 
                    key={item.label} 
                    className={item.to && location.pathname === item.to ? "active" : ""}
                    onClick={() => {
                      if (item.logout) handleLogout();
                      if (isOpen) setIsOpen(false);
                    }}
                  >
                    {item.to ? (
                      <NavLink to={item.to} className={({ isActive }) => (isActive ? "active" : "")}>
                        {item.icon} {item.label}
                      </NavLink>
                    ) : (
                      <span>{item.icon} {item.label}</span>
                    )}
                  </li>
                ))}
              </>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
}
