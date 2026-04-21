import axiosInstance from "../api/axiosInstance";

const API = "/stories";

// GET ALL
export const getStories = async () => {
  const res = await axiosInstance.get(API);
  return res.data?.data || [];
};

// CREATE
export const createStory = async (formData) => {
  const res = await axiosInstance.post(API, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// DELETE
export const deleteStory = async (id) => {
  const res = await axiosInstance.delete(`${API}/${id}`);
  return res.data;
};