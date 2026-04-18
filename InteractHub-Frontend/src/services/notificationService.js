// src/services/notificationService.js
import axios from "axios";

export const getNotifications = async () => {
  const res = await axios.get("/api/notifications");
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await axios.put(`/api/notifications/${id}/read`);
  return res.data;
};

export const markAllAsRead = async () => {
  const res = await axios.put("/api/notifications/read-all");
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await axios.delete(`/api/notifications/${id}`);
  return res.data;
};