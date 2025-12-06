/**
 * API Service
 * 
 * Centralized API client for backend communication
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Security: Validate API URL configuration
if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  console.warn('⚠️ VITE_API_URL environment variable is not set. Using default: /api');
}

// Security: Warn if not using HTTPS in production
if (import.meta.env.PROD && API_URL.startsWith('http://')) {
  console.warn('⚠️ API URL should use HTTPS in production for security');
}

// In-memory token storage
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

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

      // Add auth token from memory if available
      if (authToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${authToken}`;
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
        // Set CSRF token with security flags
        // Note: CSRF tokens need to be readable by JS (not HttpOnly)
        const isSecure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `csrf-token=${csrfToken}; path=/; SameSite=Strict${isSecure}; Max-Age=3600`;
      }

      // 2. The "First Time User" (Setup Required)
      // 2. The "First Time User" (Setup Required)
      if (response.data && response.data.code === 'SETUP_REQUIRED') {
        // window.location.href = '/onboarding'; // DISABLED: User requested to remove onboarding for now
        return response;
      }

      // 1. The "Happy Path" (Success)
      return response;
    },
    async (error) => {
      // 3. The "Not Logged In" (Unauthorized)
      if (error.response?.status === 401) {
        // Don't redirect for auth check, let the app handle it (e.g. show login page)
        if (error.config.url.includes('/auth/me')) {
          return Promise.reject(error);
        }

        // Redirect to Google Login URL for other unauthorized requests
        // window.location.href = 'http://localhost:3000/auth/google'; // REMOVED: This causes loops
        return Promise.reject(error);
      }

      // 4. The "Real Error" (Server Error)
      // Log detailed errors only in development
      if (import.meta.env.DEV) {
        console.error('API Error:', error.response?.data?.message || error.message);
        console.error('Full error:', error.response?.data);
      } else {
        // Production: Log generic message only
        console.error('An error occurred. Please try again.');
      }

      // Dispatch user-friendly error event
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: {
          message: error.response?.data?.message || 'Something went wrong, please try again.'
        }
      }));

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

    // Store token in memory
    if (response.data.token) {
      setAuthToken(response.data.token);
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

    // Store token in memory
    if (response.data.token) {
      setAuthToken(response.data.token);
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
      setAuthToken(response.data.token);
    }

    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      // User confirmed logout is a GET request
      const response = await api.get('/auth/logout');
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn('Logout endpoint not found, clearing local session only.');
        return { success: true, localOnly: true };
      }
      throw error;
    } finally {
      setAuthToken(null);
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
      setAuthToken(response.data.token);
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
    // Backend returns { settings: { storeUrl: '...', hasSettings: true } } or similar
    return response.data.settings || response.data;
  },

  /**
   * Update user settings
   */
  update: async (settings) => {
    // Map frontend camelCase to backend expected format if needed
    // User specified: storeUrl, consumerKey, consumerSecret
    const payload = {
      storeUrl: settings.woocommerceUrl || settings.storeUrl,
      consumerKey: settings.consumerKey,
      consumerSecret: settings.consumerSecret,
      // Include other settings if they exist
      ...settings,
      // Ensure storeUrl takes precedence if both exist (or overwrite woocommerceUrl if backend doesn't want it)
    };

    // Remove woocommerceUrl from payload if backend strictly validates unknown fields, 
    // but usually extra fields are ignored. 
    // However, to be clean and match the requested JSON format:
    const cleanPayload = {
      storeUrl: settings.woocommerceUrl,
      consumerKey: settings.consumerKey,
      consumerSecret: settings.consumerSecret,
      wordpressUsername: settings.wordpressUsername,
      wordpressAppPassword: settings.wordpressAppPassword,
      _csrf: getCSRFToken(),
    };

    const response = await api.post('/settings', cleanPayload);
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

