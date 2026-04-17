import axios from "axios";

export const getPosts = async () => {
  const res = await axios.get("/api/posts");
  return res.data;
};

export const createPost = async (data) => {
  const res = await axios.post("/api/posts", data);
  return res.data;
};