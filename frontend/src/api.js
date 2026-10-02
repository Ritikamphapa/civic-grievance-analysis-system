import axios from "axios";

// Set REACT_APP_API_URL in a .env file for local dev, and as a build-time
// env var on your hosting platform (Vercel/Netlify) once the backend is
// deployed. Falls back to localhost for development.
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const createComplaint = (data) => api.post("/complaints", data);
export const getComplaints = (category) =>
  api.get("/complaints", { params: category ? { category } : {} });
export const getStats = () => api.get("/complaints/stats");

export default api;
