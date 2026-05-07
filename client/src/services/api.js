import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://geopolitical-news.onrender.com",
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
export const login = (credentials) => API.post("/api/auth/login", credentials);
export const register = (userData) => API.post("/api/auth/register", userData);
export const googleAuth = (tokenId) => API.post("/api/auth/google", { tokenId });
export const getAllUsers = () => API.get("/api/auth/users");
export const forgotPassword = (email) => API.post("/api/auth/forgot-password", { email });
export const resetPassword = (token, password) => API.post(`/api/auth/reset-password/${token}`, { password });

// Saved News API
export const saveNews = (article) => API.post("/api/saved", article);
export const getSavedNews = () => API.get("/api/saved");
export const removeSavedNews = (id) => API.delete(`/api/saved/${id}`);

// Quiz API
export const getQuiz = (params) => API.post("/api/quiz/generate", params);
export const saveQuizResult = (resultData) => API.post("/api/quiz/save", resultData);
export const getQuizStats = () => API.get("/api/quiz/stats");

// Summary API
export const summarizeNews = (articleData) => API.post("/api/news/summarize", articleData);

// News API
export const getTopNews = (params) => API.get("/api/news/top", { params });
export const searchNews = (q) => API.get("/api/news/search", { params: { q } });

export default API;
