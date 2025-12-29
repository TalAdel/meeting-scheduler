import axios from 'axios';

/**
 * Axios Interceptor Configuration
 * 
 * Sets up interceptors to handle auth tokens automatically
 * This file is imported in main.tsx to ensure interceptors are set up early
 */

// Request Interceptor - runs BEFORE every request is sent
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Response Interceptor - runs AFTER every response is received
axios.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - token might be expired
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/signin') && 
          !window.location.pathname.includes('/signup')) {
        window.location.href = '/signin';
      }
    }
    
    return Promise.reject(error);
  }
);



