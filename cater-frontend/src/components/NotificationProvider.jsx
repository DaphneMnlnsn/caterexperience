import React, { createContext, useContext, useEffect, useState } from "react";

const NotificationContext = createContext([]);

export function NotificationProvider({ userId, role, children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId || !role) return;

    let channel;
    if (role === "admin") {
      channel = window.Echo.channel("notifications.admin");
    } else if (role === "staff") {
      channel = window.Echo.channel(`notifications.staff.${userId}`);
    } else if (role === "client") {
      channel = window.Echo.channel(`notifications.client.${userId}`);
    }

    if (channel) {
      channel.listen("SystemNotification", (e) => {
        setNotifications((prev) => [...prev, e.data]);
      });
    }

    return () => {
      if (channel) channel.stopListening("SystemNotification");
    };
  }, [userId, role]);

  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}