import axiosInstance from "../api/axiosInstance";

const API = "/hashtags";

export const getTrending = async (top = 10) => {
  const res = await axiosInstance.get(`${API}/trending?top=${top}`);
  return res.data;
};

export const getFollowed = async () => {
  const res = await axiosInstance.get(`${API}/followed`);
  return res.data?.data || [];
};

export const toggleFollow = async (hashtagId) => {
  const res = await axiosInstance.post(`${API}/${hashtagId}/follow`);
  return res.data?.data;
};

export const searchHashtags = async (q) => {
  const res = await axiosInstance.get(`${API}/search?q=${encodeURIComponent(q)}`);
  return res.data?.data || [];
};