import axiosInstance from "./axiosInstance";

export const commentApi = {
  // GET /api/posts/{postId}/comments
  getComments: async (postId) => {
    const res = await axiosInstance.get(`/posts/${postId}/comments`);
    return res.data;
  },

  // POST /api/posts/{postId}/comments
  createComment: async (postId, data) => {
    const res = await axiosInstance.post(
      `/posts/${postId}/comments`,
      data
    );
    return res.data;
  },

  // DELETE /api/posts/{postId}/comments/{commentId}
  deleteComment: async (postId, commentId) => {
    const res = await axiosInstance.delete(
      `/posts/${postId}/comments/${commentId}`
    );
    return res.data;
  }
};