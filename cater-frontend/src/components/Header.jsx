import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotificationProvider from "./NotificationProvider";
import NotificationsDropdown from "./NotificationsDropdown";
import { Link } from "react-router-dom";
import { FaCog } from "react-icons/fa";

export default function Header({ user }) {
  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <>
      <ToastContainer />

      <NotificationProvider userId={user.id} role={user.role}>
        <header className="topbar">
          <div className="topbar-left">
          </div>
          <div className="topbar-right">
            <span className="user-name">
              <Link to="/profile" style={{ textDecoration: 'none', color: 'black' }}>
                {user ? `${user.first_name} ${user.last_name}` : "Guest"}
              </Link>
            </span>
            <NotificationsDropdown />
            {isAdmin && (
              <Link to="/admin/backups" className="notif-icon" style={{ marginLeft: '8px', textDecoration: 'none', color: 'black' }}>
                <FaCog />
              </Link>
            )}
          </div>
        </header>
      </NotificationProvider>
    </>
  );
}