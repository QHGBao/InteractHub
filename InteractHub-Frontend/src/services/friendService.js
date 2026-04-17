import axios from "axios";

export const getFriends = async () => {
  const res = await axios.get("/api/friends");
  return res.data;
};

export const getSuggestions = async () => {
  const res = await axios.get("/api/friends/suggestions");
  return res.data;
};