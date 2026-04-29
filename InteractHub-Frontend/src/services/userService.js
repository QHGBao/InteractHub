// src/services/userService.js
import axiosInstance from '../api/axiosInstance';

export const getUserProfile = async (userId) => {
  const res = await axiosInstance.get(`/user/${userId}`);
  return res.data;
};

export const getUserPosts = async (userId) => {
  const res = await axiosInstance.get(`/post/user/${userId}`);
  return res.data;
};
