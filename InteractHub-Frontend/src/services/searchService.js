import axios from "axios";

export const searchUsers = async (q) => {
  const res = await axios.get(`/api/search/users?q=${encodeURIComponent(q)}`);
  return res.data;
};

export const searchPosts = async (q) => {
  const res = await axios.get(`/api/search/posts?q=${encodeURIComponent(q)}`);
  return res.data;
};