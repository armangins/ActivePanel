import { api, setAuthToken } from '@/services/api';
import { User, AuthResponse, LoginCredentials, SignUpCredentials } from '../types';

export const authService = {
    /**
     * Register new user
     */
    register: async (credentials: SignUpCredentials): Promise<AuthResponse> => {
        // Note: api.js handles _csrf and sanitization internally or via interceptors mostly,
        // but the original authAPI.register explicitly added _csrf. 
        // We'll rely on the existing pattern but add types.
        const response = await api.post('/auth/register', {
            email: credentials.email,
            password: credentials.password,
            name: credentials.name,
            // We assume interceptors or legacy logic handles CSRF if possible, 
            // otherwise we might need to import getCSRFToken. 
            // Looking at legacy api.js, it imports getCSRFToken locally.
            // For now, let's trust the interceptor or add it if needed. 
            // The interceptor in api.js adds X-CSRF-Token header, which is usually sufficient.
            // However, legacy register/login sent it in body too. We'll duplicate likely to be safe.
            _csrf: getCSRFToken(),
        });

        if (response.data.accessToken) {
            setAuthToken(response.data.accessToken);
        }

        return response.data;
    },

    /**
     * Login user
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', {
            email: credentials.email,
            password: credentials.password,
            _csrf: getCSRFToken(),
        });

        if (response.data.accessToken) {
            setAuthToken(response.data.accessToken);
        }

        return response.data;
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } catch (error: any) {
            // Ignore 401/404 during logout
            if (error.response && (error.response.status === 404 || error.response.status === 401)) {
                return;
            }
            throw error;
        } finally {
            setAuthToken(null);
        }
    },

    /**
     * Get current user
     */
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/auth/me');
        return response.data.user || response.data;
    },

    /**
     * Refresh token
     */
    refreshToken: async (): Promise<{ accessToken: string }> => {
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
    }
};

// Helper function duplicated from api.js to maintain behavior
function getCSRFToken(): string {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf-token='))
        ?.split('=')[1] || '';
}
