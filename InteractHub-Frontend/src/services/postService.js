import axios from "axios";
import axiosInstance from "../api/axiosInstance";

// ========== POST ==========
export const getPosts = async (page = 1, pageSize = 10) => {
  const res = await axiosInstance.get(`posts?page=${page}&pageSize=${pageSize}`);
  return res.data; // { posts, totalCount, page, pageSize, totalPages }
};

export const getPost = async(id) => {
  const res = await axiosInstance.get(`/posts/${id}`);
  return res.data;
}

export const createPost = async (data) => {
  const res = await axiosInstance.post("/posts", data);
  return res.data;
};

export const updatePost = async (id,data) => {
  const res = await axiosInstance.put(`/posts/${id}`, data);
  return res.data;
};

export const deletePost = async (id) => {
  const res = await axiosInstance.delete(`/posts/${id}`);
  return res.data;
};
// ========== LIKES ==========
export const toggleLike = async (postId) => {
  const res = await axiosInstance.post(`/posts/${postId}/like`);
  return res.data; // { isLiked, likesCount }
};

export const getLikes = async (postId) => {
  const res = await axiosInstance.get(`/posts/${postId}/likes`);
  return res.data; // { totalLikes, users }
};
// ========== COMMENTS ==========
export const getComments = async (postId) => {
  const res = await axiosInstance.get(`/posts/${postId}/comments`);
  return res.data; // Array of comments with replies
};

export const addComment = async (postId, data) => {
  const res = await axiosInstance.post(`/posts/${postId}/comments`, data);
  return res.data;
};

export const deleteComment = async (postId, commentId) => {
  const res = await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`);
  return res.data;
};
