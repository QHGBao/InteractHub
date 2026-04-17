import axios from "axios";

export const getTrending = async () => {
  const res = await axios.get("/api/hashtags/trending");
  return res.data;
};