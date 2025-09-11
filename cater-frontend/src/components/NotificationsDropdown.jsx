import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import { createPortal } from "react-dom";
import { useNotifications } from "./NotificationProvider";
import { FaBell } from "react-icons/fa";
import './NotificationsDropdown.css';

function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {notifications, markAsRead, markAllAsRead, unreadCount} = useNotifications();

  const [buttonPos, setButtonPos] = useState(null);
  const buttonRef = React.useRef();

  const toggleDropdown = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPos({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 250,
      });
    }
    setOpen(!open);
  };

  return (
    <>
        <div className="notif-wrapper">
            <FaBell size={20}  ref={buttonRef} onClick={toggleDropdown} className="relative ml-4 notif-icon"/>
            {unreadCount > 0 && (
            <span className="notif-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                {unreadCount}
            </span>
            )}
        </div>

      {open &&
        buttonPos &&
        createPortal(
            <div
            className="notifications-dropdown"
            style={{
                position: "absolute",
                top: buttonPos.top,
                left: buttonPos.left,
                zIndex: 9999,
            }}
            >
            <div className="notifications-dropdown-header flex justify-between items-center">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="user-save-btn text-sm text-blue-500 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications && notifications.length > 0 ? (
              notifications.map((n, idx) => (
                <div
                    key={idx}
                    className={`notifications-dropdown-item ${
                        !n.read_at ? "notifications-dropdown-item-unread" : ""
                    }`}
                    onClick={() => {
                        markAsRead(n.id);
                        if (n.url) navigate(n.url);
                    }}
                >
                  {n.message || JSON.stringify(n)}
                </div>
              ))
            ) : (
              <div className="notifications-dropdown-empty">
                No notifications
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export default NotificationsDropdown;