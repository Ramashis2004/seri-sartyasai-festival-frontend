import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

API.interceptors.request.use((req) => {
  const token = sessionStorage.getItem("token");  // <-- changed
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
