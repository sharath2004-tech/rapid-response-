import axios from 'axios';

// Ensure API URL ends with /api
const getApiUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Remove trailing slash if present, then ensure /api is at the end
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
