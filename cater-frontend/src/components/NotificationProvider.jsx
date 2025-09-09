import React, { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NotificationContext = createContext([]);

export default function NotificationProvider({ userId, children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    axiosClient
      .get("/notifications")
      .then((res) => {
        const dataArray = Array.isArray(res.data) ? res.data : res.data.data;

        const formatted = dataArray.map((n) => ({
          id: n.id,
          read_at: n.read_at,
          message: n.data?.message || "No message",
          url: n.data?.url || "#",
        }));

        setNotifications(formatted);
      })
      .catch((err) => console.error("Failed to fetch notifications", err));
  }, [userId]);

  useEffect(() => {
    if (!userId || !window.Echo) return;

    const channel = window.Echo.private(`App.Models.User.${userId}`);

    const handleNotification = (payload) => {

      const newNotif = {
        id: payload.id,
        message: payload.message || "No message",
        url: payload.url || "#",
        read_at: payload.read_at || null,
      };

      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });

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

    channel.notification(handleNotification);

    return () => {
      channel.stopListening(".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated");
    };
  }, [userId]);

  const markAsRead = (id) => {
    axiosClient.post(`/notifications/${id}/read`).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date() } : n))
      );
    });
  };

  const markAllAsRead = () => {
    axiosClient.post("/notifications/read-all").then(() => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date() }))
      );
    });
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, markAsRead, markAllAsRead, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}