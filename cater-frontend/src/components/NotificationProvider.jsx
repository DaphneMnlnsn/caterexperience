import React, { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Ably from "ably";
import './NotificationsDropdown.css';

const NotificationContext = createContext([]);

export default function NotificationProvider({ userId, role = "user", children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    axiosClient.get("/notifications")
      .then((res) => {
        const dataArray = Array.isArray(res.data) ? res.data : res.data.data;
        setNotifications(dataArray.map(n => ({
          id: n.id,
          read_at: n.read_at,
          message: n.data?.message || "No message",
          url: n.data?.url || "#",
        })));
      })
      .catch((err) => console.error("Failed to fetch notifications", err));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const model = role === "client" ? "Customer" : "User";
    const channelName = `notifications-App.Models.${model}.${userId}`;

    const ablyClient = new Ably.Realtime({ key: process.env.REACT_APP_ABLY_KEY });
    const channel = ablyClient.channels.get(channelName);

    const handleNotification = (message) => {
      const payload = message.data;
      const newNotif = {
        id: payload.id,
        message: payload.message || "No message",
        url: payload.url || "#",
        read_at: payload.read_at || null,
      };

      setNotifications((prev) => prev.some(n => n.id === newNotif.id) ? prev : [newNotif, ...prev]);

      toast.warn(newNotif.message, {
        position: "top-right",
        autoClose: 5000,
        pauseOnHover: true,
        draggable: true,
        className: "custom-toast",
        bodyClassName: "custom-toast-body",
        progressClassName: "custom-toast-progress",
      });
    };

    channel.subscribe("NewNotification", handleNotification);

    return () => channel.unsubscribe();
  }, [userId, role]);

  const markAsRead = (id) => {
    axiosClient.post(`/notifications/${id}/read`).then(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
    });
  };

  const markAllAsRead = () => {
    axiosClient.post("/notifications/read-all").then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })));
    });
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, markAllAsRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
