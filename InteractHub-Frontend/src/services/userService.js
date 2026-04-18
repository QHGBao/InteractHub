// src/services/userService.js
import axios from "axios";

export const getUserProfile = async (userId) => {
  const res = await axios.get(`/api/users/${userId}`);
  return res.data;
};

export const getUserPosts = async (userId) => {
  const res = await axios.get(`/api/posts/user/${userId}`);
  return res.data;
};