import axiosInstance from "../api/axiosInstance";

const API = "/stories";

// ─── Lấy story của chính mình — dùng cho StoriesPage ────────────
export const getStories = async () => {
  const res = await axiosInstance.get(API);
  return res.data?.data || [];
};

// ─── Lấy story bản thân + bạn bè — dùng cho Feed sau này ────────
export const getFeedStories = async () => {
  const res = await axiosInstance.get(`${API}/feed`);
  return res.data?.data || [];
};

// ─── Tạo story mới ───────────────────────────────────────────────
export const createStory = async (formData) => {
  const res = await axiosInstance.post(API, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ─── Xoá story ───────────────────────────────────────────────────
export const deleteStory = async (id) => {
  const res = await axiosInstance.delete(`${API}/${id}`);
  return res.data;
};