import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach Bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response ? error.response.status : null;
    const message = error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : error.message || 'An unexpected error occurred';

    if (status === 401) {
      // Clear token on unauthorized if not on auth routes
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error(message || 'Access denied. You do not have permission for this action.');
    }

    return Promise.reject(new Error(message));
  }
);

export default API;
