import api from "./api";

export const getUsers = () => api.get("/users");

export const getPosts = () => api.get("/posts");

export const banUser = (id) => api.post(`/users/${id}/ban`);

export const deletePost = (id) => api.delete(`/posts/${id}`);