import { createContext, useContext, useEffect, useState } from 'react';
import { notificationApi } from '../api/notificationApi';
import useSignalR from '../hooks/useSignalR';
import { useAuth } from './AuthContext'; // ✅ thêm

const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  const handleNewNotification = (notification) => {
    const currentUserId = user?.userId; 

    if (!user || !currentUserId) return;

    if (notification.userId?.toLowerCase() !== currentUserId?.toLowerCase()) return;

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  useSignalR(handleNewNotification);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getAll();
      setNotifications(data);
    } catch (err) {
      setError('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Theo dõi user thay đổi thay vì chỉ chạy 1 lần
  useEffect(() => {
    if (user) {
      // Có user → fetch data của user đó
      fetchNotifications();
      fetchUnreadCount();
    } else {
      // Logout → reset sạch
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
    }
  }, [user]); // ← dependency là user, không phải []

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading, error,
      fetchNotifications, markAsRead, markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};