/**
 * API Service
 * 
 * Centralized API client for backend communication
 */

import axios from 'axios';
import { sanitizeInput } from '../utils/security';

let API_URL = import.meta.env.VITE_API_URL || '/api';

// Security: Enforce HTTPS in production
if (import.meta.env.PROD && API_URL.startsWith('http://')) {
  API_URL = API_URL.replace('http://', 'https://');
}

// Security: Validate API URL configuration
if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {

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
    withCredentials: true, // Important for cookies - must be true for session cookies to work
    // headers: { 'Content-Type': 'application/json' } // Removed: Let Axios set content type automatically (needed for multipart/form-data)
  });

  // Request interceptor - add Bearer token and CSRF token
  instance.interceptors.request.use(
    (config) => {
      // Add Bearer token from memory if available
      if (authToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }

      // Add CSRF token for state-changing operations
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle errors, token refresh, and CSRF token
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

      // Handle setup required
      if (response.data && response.data.code === 'SETUP_REQUIRED') {
        return response;
      }

      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized - Token Expired
      if (error.response?.status === 401) {
        // Check if this is a token expiration error
        const isTokenExpired = error.response?.data?.code === 'TOKEN_EXPIRED';

        // Don't retry for auth endpoints or if already retried
        const isAuthEndpoint = originalRequest.url?.includes('/auth/me') ||
          originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/refresh');

        if (isTokenExpired && !isAuthEndpoint && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const response = await instance.post('/auth/refresh', {}, {
              withCredentials: true,
            });

            if (response.data.accessToken) {
              // Update token in memory
              setAuthToken(response.data.accessToken);

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
              return instance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - clear token and redirect to login
            setAuthToken(null);
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // For auth endpoints or already retried, just reject
        return Promise.reject(error);
      }

      // Handle other errors
      const isSettings404 = error.config?.url?.includes('/settings') && error.response?.status === 404;

      // Log detailed errors only in development (skip expected 404s)
      if (import.meta.env.DEV && !isSettings404) {
        console.error('API Error:', error.response?.data?.message || error.message);
        console.error('Full error:', error.response?.data);
      } else if (!isSettings404) {
        // Production: Log generic message only (skip expected 404s)
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
      email: sanitizeInput(email),
      password, // Do not sanitize password to allow special characters
      name: sanitizeInput(name),
      _csrf: getCSRFToken(), // CSRF token in body
    });

    // ...
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email: sanitizeInput(email),
      password, // Do not sanitize password
      _csrf: getCSRFToken(),
    });

    // Store access token in memory
    if (response.data.accessToken) {
      setAuthToken(response.data.accessToken);
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
      // JWT logout is a POST request with Bearer token
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn('Logout endpoint not found, clearing local session only.');
        return { success: true, localOnly: true };
      }
      throw error;
    } finally {
      // Clear token from memory
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
   * Refresh access token using refresh token from httpOnly cookie
   */
  refreshToken: async () => {
    const response = await api.post('/auth/refresh', {}, {
      withCredentials: true,
    });

    if (response.data.accessToken) {
      setAuthToken(response.data.accessToken);
    }

    return response.data;
  },
};

/**
 * Onboarding API
 */
export const onboardingAPI = {
  /**
   * Mark onboarding as completed
   */
  complete: async () => {
    const response = await api.post('/auth/onboarding/complete');
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
    // Backend returns { settings: { ... } } or { settings: null } for new users
    return response.data.settings || null;
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
      storeUrl: sanitizeInput(settings.woocommerceUrl || settings.storeUrl || ''),
      consumerKey: sanitizeInput(settings.consumerKey || ''),
      consumerSecret: sanitizeInput(settings.consumerSecret || ''),
      wordpressUsername: sanitizeInput(settings.wordpressUsername || ''),
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

