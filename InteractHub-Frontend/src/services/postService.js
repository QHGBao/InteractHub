// src/services/postService.js
import { postApi } from "../api/postApi";

// ========== POST ==========
export const getPosts = async (page = 1, pageSize = 10) => {
  return await postApi.getPosts(page, pageSize);
};

export const getPost = async (id) => {
  return await postApi.getPost(id);
};

export const createPost = async (data) => {
  return await postApi.createPost(data);
};

export const updatePost = async (id, data) => {
  return await postApi.updatePost(id, data);
};

export const deletePost = async (id) => {
  return await postApi.deletePost(id);
};