/**
 * API Service
 * 
 * Centralized API client for backend communication.
 * Handles authentication, CSRF protection, response interception, and global error handling.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { sanitizeInput } from '../utils/security';

// Environment variable for API URL
let API_URL = import.meta.env.VITE_API_URL || '/api';

// Ensure API_URL ends with /api (unless it's empty/relative root which implies proxy)
if (API_URL && !API_URL.endsWith('/api') && API_URL !== '/') {
    API_URL += '/api';
}

// Security: Enforce HTTPS in production
if (import.meta.env.PROD && API_URL.startsWith('http://')) {
    API_URL = API_URL.replace('http://', 'https://');
}

// In-memory token storage
let authToken: string | null = null;

/**
 * Set the authentication token in memory.
 * @param token - The access token to store.
 */
export const setAuthToken = (token: string | null) => {
    authToken = token;
};

// Callback to sync React state when token is refreshed by interceptor
let onRefreshSuccess: ((token: string) => void) | null = null;

/**
 * Register a callback to be executed when the token is successfully refreshed.
 * @param cb - The callback function.
 */
export const setOnRefreshSuccess = (cb: (token: string) => void) => {
    onRefreshSuccess = cb;
};

/**
 * Get the current authentication token.
 * @returns The stored access token or null.
 */
export const getAuthToken = () => authToken;

/**
 * Get CSRF token from cookie.
 * Frontend reads it from `csrf-token` cookie set by the backend.
 * @returns The CSRF token string.
 */
const getCSRFToken = (): string => {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf-token='))
        ?.split('=')[1] || '';
};

// Interface for custom error dispatched to window
interface ApiErrorDetail {
    message: string;
}

// Custom event declaration for window
declare global {
    interface WindowEventMap {
        'api-error': CustomEvent<ApiErrorDetail>;
    }
}

/**
 * Create an Axios instance with default configuration, interceptors for Auth and CSRF.
 * @returns Configured AxiosInstance.
 */
const createApiClient = (): AxiosInstance => {

    const instance = axios.create({
        baseURL: API_URL,
        withCredentials: true, // Important for cookies - must be true for session/httpOnly cookies to work
    });

    // Request interceptor - add Bearer token and CSRF token
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            // Add Bearer token from memory if available
            if (authToken && config.headers && !config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${authToken}`;
            }

            // Add CSRF token for state-changing operations (POST, PUT, DELETE, PATCH)
            // GET and HEAD requests don't need CSRF protection
            // /auth/refresh is excluded because it uses httpOnly cookie for authentication
            const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
            const method = config.method?.toUpperCase() || 'GET';
            const isRefreshEndpoint = config.url?.includes('/auth/refresh');

            if (stateChangingMethods.includes(method) && !isRefreshEndpoint) {
                const csrfToken = getCSRFToken();
                if (csrfToken && config.headers) {
                    config.headers.set('X-CSRF-Token', csrfToken);
                } else {
                    // Log warning if CSRF token is missing for state-changing operations
                    if (import.meta.env.DEV) {
                        console.warn('CSRF token missing for state-changing operation:', method, config.url);
                        console.log('Current Cookies:', document.cookie);
                    }
                }
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor - handle errors, token refresh, and CSRF token
    instance.interceptors.response.use(
        (response: AxiosResponse) => {
            // Update CSRF token from response header if present
            const csrfToken = response.headers['x-csrf-token'];
            if (csrfToken) {
                // Set CSRF token with security flags
                const isSecure = window.location.protocol === 'https:' ? '; Secure' : '';
                document.cookie = `csrf-token=${csrfToken}; path=/; SameSite=Strict${isSecure}; Max-Age=3600`;
            }

            // Handle setup required response (specific to this app logic)
            if (response.data && response.data.code === 'SETUP_REQUIRED') {
                return response;
            }

            return response;
        },
        async (error: AxiosError<any>) => {
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

            // Handle 401 Unauthorized - Token Expired
            if (error.response?.status === 401 && originalRequest) {
                // Check if error indicates token expiration
                const isTokenExpired = error.response?.data?.code === 'TOKEN_EXPIRED' ||
                    error.response?.data?.message?.toLowerCase().includes('token expired') ||
                    error.response?.data?.message?.toLowerCase().includes('unauthorized');

                // Don't retry for auth endpoints to avoid infinite loops
                const isAuthEndpoint = originalRequest.url?.includes('/auth/me') ||
                    originalRequest.url?.includes('/auth/login') ||
                    originalRequest.url?.includes('/auth/register') ||
                    originalRequest.url?.includes('/auth/logout') ||
                    originalRequest.url?.includes('/auth/refresh') ||
                    originalRequest.url?.includes('/auth/google');

                if (isTokenExpired && !isAuthEndpoint && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        // Try to refresh the token using httpOnly cookie
                        const response = await instance.post('/auth/refresh', {}, {
                            withCredentials: true,
                        });

                        if (response.data.accessToken) {
                            // Update token in memory
                            setAuthToken(response.data.accessToken);

                            // Sync with React state if callback registered
                            if (onRefreshSuccess) {
                                onRefreshSuccess(response.data.accessToken);
                            }

                            // Retry original request with new token
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                            }
                            return instance(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed - clear token and redirect to login
                        setAuthToken(null);
                        // Only redirect if not already on login page
                        if (!window.location.pathname.includes('/login')) {
                            window.location.href = '/login';
                        }
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
                // Production: Log generic message
                console.error('An error occurred. Please try again.');
            }

            // Dispatch user-friendly error event for UI components to listen to
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
 * Authentication API Service
 */
export const authAPI = {
    /**
     * Register new user.
     * @param email - User email
     * @param password - User password
     * @param name - User full name
     * @returns Promise with registration result (accessToken, user)
     */
    register: async (email: string, password: string, name: string) => {
        const response = await api.post('/auth/register', {
            email: sanitizeInput(email),
            password, // Do not sanitize password to allow special characters
            name: sanitizeInput(name),
            _csrf: getCSRFToken(),
        });

        if (response.data.accessToken) {
            setAuthToken(response.data.accessToken);
        }

        return response.data;
    },

    /**
     * Login user.
     * @param email - User email
     * @param password - User password
     * @returns Promise with login result (accessToken, user)
     */
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', {
            email: sanitizeInput(email),
            password, // Do not sanitize password
            _csrf: getCSRFToken(),
        });

        if (response.data.accessToken) {
            setAuthToken(response.data.accessToken);
        }

        return response.data;
    },

    /**
     * Google OAuth login.
     * Note: Usually handled via redirect logic, this is for direct credential posting if used.
     * @param credential - Google OAuth credential
     * @returns Promise with auth result
     */
    googleLogin: async (credential: string) => {
        const response = await api.post('/auth/google', {
            credential,
            _csrf: getCSRFToken(),
        });

        const token = response.data.accessToken || response.data.token;
        if (token) {
            setAuthToken(token);
        }

        return response.data;
    },

    /**
     * Logout user.
     * Calls backend logout to clear cookies and invalidates local token.
     * @returns Promise with success status.
     */
    logout: async () => {
        try {
            const response = await api.post('/auth/logout');
            return response.data || { success: true };
        } catch (error: any) {
            // 401 is expected if token is expired - still consider logout successful
            if (error.response && (error.response.status === 404 || error.response.status === 401)) {
                return { success: true, localOnly: true };
            }
            throw error;
        } finally {
            setAuthToken(null);
        }
    },

    /**
     * Get current authenticated user profile.
     * @returns Promise with user object.
     */
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data.user || response.data;
    },

    /**
     * Refresh access token using httpOnly cookie.
     * @returns Promise with new access token data.
     */
    refreshToken: async () => {
        const response = await api.post('/auth/refresh', {}, {
            withCredentials: true,
        });

        const token = response.data.accessToken;
        if (token) {
            setAuthToken(token);
        } else {
            throw new Error('No access token in refresh response');
        }

        return response.data;
    },
};

interface SettingsPayload {
    storeUrl?: string;
    woocommerceUrl?: string;
    consumerKey?: string;
    consumerSecret?: string;
    wordpressUsername?: string;
    wordpressAppPassword?: string;
    [key: string]: any;
}

/**
 * Settings API Service
 */
export const settingsAPI = {
    /**
     * Get user settings.
     * @returns Promise with settings object.
     */
    get: async () => {
        const response = await api.get('/settings');
        return response.data.settings || response.data || null;
    },

    /**
     * Update user settings.
     * @param settings - The settings object to update.
     * @returns Promise with updated settings.
     */
    update: async (settings: SettingsPayload) => {
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

interface UserProfile {
    id?: number | string;
    email?: string;
    name?: string;
    [key: string]: any;
}

/**
 * Users API Service
 */
export const usersAPI = {
    /**
     * Get current user profile (alias for auth.getCurrentUser essentially, but via /users endpoint).
     * @returns Promise with user profile.
     */
    getProfile: async () => {
        const response = await api.get('/users/me');
        return response.data.user || response.data;
    },

    /**
     * Update user profile.
     * @param profile - Partial profile data to update.
     * @returns Promise with updated user profile.
     */
    updateProfile: async (profile: Partial<UserProfile>) => {
        const response = await api.put('/users/me', {
            ...profile,
            _csrf: getCSRFToken(),
        });
        return response.data.user || response.data;
    },
};
