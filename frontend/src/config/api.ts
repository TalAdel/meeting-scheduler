// API configuration for backend connection
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    SIGNIN: `${API_BASE_URL}/auth/login`, 
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  },
  USERS: {
    BASE: `${API_BASE_URL}/users`,
  },
  MEETINGS: {
    BASE: `${API_BASE_URL}/meetings`,
  },
};

