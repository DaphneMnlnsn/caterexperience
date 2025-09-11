import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotificationProvider from "./NotificationProvider";
import NotificationsDropdown from "./NotificationsDropdown";

export default function Header({ user }) {
  if (!user) return null;

  return (
    <>
      <ToastContainer />

      <NotificationProvider userId={user.id} role={user.role}>
        <header className="topbar">
          <div className="topbar-left"></div>
          <div className="topbar-right">
            <span className="user-name">
              {user ? `${user.first_name} ${user.last_name}` : "Guest"}
            </span>
            <NotificationsDropdown />
          </div>
        </header>
      </NotificationProvider>
    </>
  );
}