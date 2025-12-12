import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sanitizeInput } from '../utils/security';
import { authAPI, setAuthToken, getAuthToken } from '../services/api';
import useTokenRefresh from '../hooks/useTokenRefresh';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Refresh access token using refresh token from httpOnly cookie
   */
  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await authAPI.refreshToken();

      if (response.accessToken) {
        setAccessToken(response.accessToken);
        setAuthToken(response.accessToken);
        return response.accessToken;
      }

      throw new Error('No access token in refresh response');
    } catch (error) {
      // Refresh failed - clear tokens and logout
      setAccessToken(null);
      setAuthToken(null);
      setUser(null);
      throw error;
    }
  }, []);

  /**
   * Initialize authentication on mount
   * Try to refresh token to check if user has valid refresh token
   */
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Try to refresh token (uses httpOnly cookie)
        const newAccessToken = await refreshAccessToken();

        if (isMounted && newAccessToken) {
          // Get user data
          const currentUser = await authAPI.getCurrentUser();
          if (isMounted) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        // Not authenticated or refresh failed
        if (isMounted) {
          setAccessToken(null);
          setAuthToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshAccessToken]);

  /**
   * Set up automatic token refresh
   * Refreshes every 14 minutes (1 minute before 15-minute expiration)
   */
  useTokenRefresh(accessToken, refreshAccessToken);

  /**
   * Login with email/password or OAuth
   * @param {Object} userData - User data from login response
   * @param {string} token - Access token from login response
   */
  const login = useCallback(async (userData, token) => {
    // Store access token
    if (token) {
      setAccessToken(token);
      setAuthToken(token);
    }

    // Validate and sanitize picture URL
    let pictureUrl = null;
    if (userData.picture && typeof userData.picture === 'string') {
      const trimmedPicture = userData.picture.trim();
      // Only accept valid HTTP(S) URLs
      if (trimmedPicture.length > 0 && (trimmedPicture.startsWith('http://') || trimmedPicture.startsWith('https://'))) {
        pictureUrl = trimmedPicture;
      }
    }

    // Sanitize and secure user data before storing
    const sanitizedUserData = {
      id: userData.id,
      email: sanitizeInput(userData.email || ''),
      name: sanitizeInput(userData.displayName || userData.name || ''),
      picture: pictureUrl,
      role: userData.role || 'user',
      provider: userData.provider || 'email',
      onboardingCompleted: userData.onboardingCompleted || false,
    };

    // NEVER store password or sensitive data
    delete sanitizedUserData.password;
    delete sanitizedUserData.token;
    delete sanitizedUserData.secret;

    setUser(sanitizedUserData);
  }, []);

  /**
   * Logout user
   * Clears access token and calls backend to revoke refresh token
   */
  const logout = useCallback(async () => {
    try {
      // Call backend logout (requires Bearer token)
      await authAPI.logout();
    } catch (error) {
      // Continue even if logout fails
      console.error('[Logout] Error:', error.message);
    } finally {
      // Clear tokens and user state
      setAccessToken(null);
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  /**
   * Get current access token
   * Exported for use in API client
   */
  const getToken = useCallback(() => {
    return accessToken;
  }, [accessToken]);

  const value = {
    user,
    accessToken,
    login,
    logout,
    refreshAccessToken,
    getToken,
    loading,
    isAuthenticated: !!user && !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

