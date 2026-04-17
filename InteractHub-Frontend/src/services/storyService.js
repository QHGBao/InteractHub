// src/services/storyService.js
import axios from "axios";

export const getStories = async () => {
  const res = await axios.get("/api/stories");
  return res.data;
};

export const createStory = async (data) => {
  const res = await axios.post("/api/stories", data);
  return res.data;
};

export const deleteStory = async (id) => {
  const res = await axios.delete(`/api/stories/${id}`);
  return res.data;
};