import axiosInstance from "../api/axiosInstance";

const API = "/search";

// GET /api/search/users?q=...
export const searchUsers = async (q) => {
  const res = await axiosInstance.get(`${API}/users?q=${encodeURIComponent(q)}`);
  return res.data?.data || [];
};

// GET /api/search/posts?q=...
export const searchPosts = async (q) => {
  const res = await axiosInstance.get(`${API}/posts?q=${encodeURIComponent(q)}`);
  return res.data?.data || [];
};