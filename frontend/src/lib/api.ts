import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Clerk token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clerk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Check if it's a token expiration error
      const errorData = error.response?.data;
      const isTokenExpired = errorData?.code === 'TOKEN_EXPIRED' || 
                           errorData?.error?.toLowerCase().includes('expired') ||
                           error.response?.headers['x-token-expired'] === 'true';
      
      if (isTokenExpired) {
        console.log('Token expired, clearing and will retry with fresh token');
        // Clear expired token
        localStorage.removeItem('clerk_token');
        
        // For token expiration, we don't want to redirect immediately
        // Let the retry mechanism handle getting a fresh token
      } else {
        // For other auth errors, clear token and potentially redirect
        localStorage.removeItem('clerk_token');
        console.log('Authentication error, clearing token');
      }
    }
    return Promise.reject(error);
  }
);

export default api; 