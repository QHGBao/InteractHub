import axiosInstance from "./axiosInstance";

export const likeApi = {
  // POST /api/posts/{postId}/like
  toggleLike: async (postId) => {
    const res = await axiosInstance.post(`/posts/${postId}/like`);
    return res.data;
  },

  // GET /api/posts/{postId}/unlike
  getUnlikes: async (postId) => {
    const res = await axiosInstance.get(`/posts/${postId}/unlike`);
    return res.data;
  }
};