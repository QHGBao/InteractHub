import axiosInstance from "../api/axiosInstance";

// Upload 1 ảnh
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axiosInstance.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  
  return res.data;
};

// Upload nhiều ảnh cùng lúc
export const uploadMultipleImages = async (files) => {
  const uploadPromises = files.map(file => uploadImage(file));
  const results = await Promise.all(uploadPromises);
  
  // Trả về array URLs
  return results.map(r => `http://localhost:5022${r.url}`);
};