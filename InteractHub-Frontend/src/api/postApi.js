import axiosInstance from "./axiosInstance";

export const postApi = {
  // GET /api/posts?page=&pageSize=
  getPosts: async (page = 1, pageSize = 10) => {
    const res = await axiosInstance.get("/posts", {
      params: { page, pageSize }
    });
    return res.data;
  },

  // GET /api/posts/{id}
  getPost: async (postId) => {
    const res = await axiosInstance.get(`/posts/${postId}`);
    return res.data;
  },

  // POST /api/posts
  createPost: async (data) => {
    const res = await axiosInstance.post("/posts", data);
    return res.data;
  },

  sharePost: async (postId, content) => {
    const res = await axiosInstance.post("/posts", {
      content,
      sharedPostId: postId
    });
    return res.data;
  },

  // PUT /api/posts/{postId}
  updatePost: async (postId, data) => {
    const res = await axiosInstance.put(`/posts/${postId}`, data);
    return res.data;
  },

  // DELETE /api/posts/{postId}
  deletePost: async (postId) => {
    const res = await axiosInstance.delete(`/posts/${postId}`);
    return res.data;
  }
};
