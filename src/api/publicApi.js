import axios from "axios";

// Standalone axios instance WITHOUT auth header
const publicApi = axios.create({ baseURL: "http://localhost:4000/api" });

export const getPublicEvents = async () => {
  const { data } = await publicApi.get("/public/events");
  return data;
};

export const getPublicDistrictEvents = async () => {
  const { data } = await publicApi.get("/public/district-events");
  return data;
};

export const getPublicAnnouncements = async () => {
  const { data } = await publicApi.get("/public/announcements");
  return data;
};

export const sendContact = async ({ name, email, subject, message }) => {
  const { data } = await publicApi.post("/public/contact", { name, email, subject, message });
  return data;
};

export default { getPublicEvents, getPublicDistrictEvents, getPublicAnnouncements, sendContact };
