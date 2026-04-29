import axiosInstance from './axiosInstance';

export const notificationApi = {
  // Lấy danh sách thông báo
  getAll: async () => {
    const res = await axiosInstance.get('/notifications');
    return res.data.data;
  },

  // Đếm chưa đọc
  getUnreadCount: async () => {
    const res = await axiosInstance.get('/notifications/unread-count');
    return res.data.data;
  },

  // Đánh dấu 1 thông báo đã đọc
  markAsRead: async (id) => {
    await axiosInstance.put(`/notifications/${id}/read`);
  },

  // Đánh dấu tất cả đã đọc
  markAllAsRead: async () => {
    await axiosInstance.put('/notifications/read-all');
  },
};