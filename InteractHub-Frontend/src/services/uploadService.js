// Upload ảnh hoặc video lên server
import axiosInstance from "../api/axiosInstance";

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axiosInstance.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  
  return res.data; // { url, fileName, size }
};