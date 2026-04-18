// src/services/adminService.js
import axios from "axios";

export const getUsers = async () => {
  const res = await axios.get("/api/users");
  return res.data;
};

export const getPosts = async () => {
  const res = await axios.get("/api/posts");
  return res.data;
};

export const banUser = async (id) => {
  const res = await axios.post(`/api/users/${id}/ban`);
  return res.data;
};

export const deletePost = async (id) => {
  const res = await axios.delete(`/api/posts/${id}`);
  return res.data;
};