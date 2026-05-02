import axiosInstance from './axiosInstance';

// ── Reports ────────────────────────────────────────────────────
export const getReports      = (status) =>
    axiosInstance.get('/admin/reports', { params: status ? { status } : {} });

export const getReportDetail = (reportId) =>
    axiosInstance.get(`/admin/reports/${reportId}`);

export const resolveReport   = (reportId, data) =>
    axiosInstance.patch(`/admin/reports/${reportId}/resolve`, data);

export const deletePost      = (postId) =>
    axiosInstance.delete(`/admin/posts/${postId}`);

// ── Users ──────────────────────────────────────────────────────
export const getUsers        = (isActive) =>
    axiosInstance.get('/admin/users', { params: isActive !== undefined ? { isActive } : {} });

export const getUserDetail   = (userId) =>
    axiosInstance.get(`/admin/users/${userId}`);

export const setUserActive   = (userId, isActive) =>
    axiosInstance.patch(`/admin/users/${userId}/active`, { isActive });