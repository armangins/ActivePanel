/**
 * API Service
 * 
 * Centralized API client for backend communication
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get CSRF token from cookie or header
 */
const getCSRFToken = () => {
  // CSRF token is set by backend in cookie
  // Frontend reads it from response header
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf-token='))
    ?.split('=')[1] || '';
};

/**
 * Create axios instance with default config
 */
const createApiClient = () => {
  
  const instance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add CSRF token
  instance.interceptors.request.use(
    (config) => {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
      
      // Add auth token from localStorage if available (fallback)
      const token = localStorage.getItem('auth_token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle errors and update CSRF token
  instance.interceptors.response.use(
    (response) => {
      // Update CSRF token from response header
      const csrfToken = response.headers['x-csrf-token'];
      if (csrfToken) {
        document.cookie = `csrf-token=${csrfToken}; path=/; SameSite=Strict`;
      }
      
      return response;
    },
    async (error) => {
      // Handle 401 - token expired
      if (error.response?.status === 401) {
        // Try to refresh token
        try {
          const refreshResponse = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          
          // Retry original request
          const originalRequest = error.config;
          if (refreshResponse.data.token) {
            localStorage.setItem('auth_token', refreshResponse.data.token);
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed - logout user
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createApiClient();

/**
 * Auth API
 */
export const authAPI = {
  /**
   * Register new user
   */
  register: async (email, password, name) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
      _csrf: getCSRFToken(), // CSRF token in body
    });
    
    // Store token in localStorage as fallback
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
      _csrf: getCSRFToken(),
    });
    
    // Store token in localStorage as fallback
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  },

  /**
   * Google OAuth login
   */
  googleLogin: async (credential) => {
    const response = await api.post('/auth/google', {
      credential,
      _csrf: getCSRFToken(),
    });
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue even if logout fails
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  /**
   * Refresh token
   */
  refreshToken: async () => {
    const response = await api.post('/auth/refresh', {}, {
      withCredentials: true,
    });
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  },
};

/**
 * Settings API
 */
export const settingsAPI = {
  /**
   * Get user settings
   */
  get: async () => {
    const response = await api.get('/settings');
    return response.data.settings;
  },

  /**
   * Update user settings
   */
  update: async (settings) => {
    const response = await api.put('/settings', {
      ...settings,
      _csrf: getCSRFToken(),
    });
    return response.data.settings;
  },
};

/**
 * Users API
 */
export const usersAPI = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data.user;
  },

  /**
   * Update user profile
   */
  updateProfile: async (profile) => {
    const response = await api.put('/users/me', {
      ...profile,
      _csrf: getCSRFToken(),
    });
    return response.data.user;
  },
};

