import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Add a request interceptor to include the auth token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("geointelx_token");
  if (token) {
    req.headers['Authorization'] = `Bearer ${token}`;
    // Also try lowercase just in case
    req.headers['authorization'] = `Bearer ${token}`;
  } else {
    console.warn("API Interceptor: No token found in localStorage");
  }
  return req;
}, (error) => {
  return Promise.reject(error);
});

// Auth API
export const login = (credentials) => API.post("/auth/login", credentials);
export const register = (userData) => API.post("/auth/register", userData);
export const googleAuth = (tokenId) => API.post("/auth/google", { tokenId });
export const getAllUsers = () => API.get("/auth/users");
export const forgotPassword = (email) => API.post("/auth/forgot-password", { email });
export const resetPassword = (token, password) => API.post(`/auth/reset-password/${token}`, { password });

// Saved News API
export const saveNews = (article) => API.post("/saved", article);
export const getSavedNews = () => API.get("/saved");
export const removeSavedNews = (id) => API.delete(`/saved/${id}`);

// Quiz API
export const getQuiz = (params) => API.post("/quiz/generate", params);
export const saveQuizResult = (resultData) => API.post("/quiz/save", resultData);
export const getQuizStats = () => API.get("/quiz/stats");

// Summary API
export const summarizeNews = (articleData) => API.post("/news/summarize", articleData);

// News API
export const getTopNews = (params) => API.get("/news/top", { params });
export const searchNews = (q) => API.get("/news/search", { params: { q } });

export default API;
