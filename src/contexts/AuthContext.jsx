import { createContext, useContext, useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { authAPI, setAuthToken, setOnRefreshSuccess } from '../services/api';
import { sanitizeInput, clearSensitiveData } from '../utils/security';

// Create context with default values
const AuthContext = createContext({
  user: null,
  accessToken: null,
  loading: true,
  login: async () => { },
  logout: async () => { },
  refreshAccessToken: async () => { },
  getToken: () => null,
  isAuthenticated: false,
});

export const AuthProvider = ({ children }) => {
  // Access Token stored in memory ONLY (Requirement: Frontend 1)
  // State: undefined (loading), valid string (signed in), or null (signed out)
  // We use 'loading' state to represent the undefined/initial check phase
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Requirement: Use useLayoutEffect to inject token into interceptors 
  // This runs synchronously after DOM mutations but before browser paint.
  useLayoutEffect(() => {
    setAuthToken(accessToken);
  }, [accessToken]);

  // Sync API token refresh with React state
  // This handles cases where api.js auto-refreshes the token via interceptors
  useEffect(() => {
    setOnRefreshSuccess((newToken) => {
      setAccessToken(newToken);
    });
    return () => setOnRefreshSuccess(null);
  }, []);

  // Initial Authentication Check (Mount only)
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Requirement: Attempt to check validity of Refresh Token in httpOnly cookie
        // If valid, server generates new Access Token
        // This effectively "logs in" the user if they have a valid session
        const response = await authAPI.refreshToken();

        if (response.accessToken && isMounted) {
          setAccessToken(response.accessToken);

          // Fetch user profile to ensure we have full user data
          try {
            const userData = await authAPI.getCurrentUser();
            if (isMounted) {
              setUser(userData);
            }
          } catch (userError) {
            console.error('Failed to fetch user profile after refresh:', userError);
          }
        }
      } catch (error) {
        // If refresh fails (401/403), user is not authenticated
        if (isMounted) {
          setAccessToken(null);
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
  }, []);

  // Login Function - updates state with token and user data
  // Legacy signature: (userData, token) - typically called after API login
  const login = useCallback(async (userData, token) => {
    setLoading(true);
    try {
      if (token) {
        setAccessToken(token);
      }

      if (userData) {
        // Sanitize user data
        const sanitizedUser = {
          ...userData,
          email: sanitizeInput(userData.email || ''),
          displayName: sanitizeInput(userData.displayName || userData.name || ''),
        };
        setUser(sanitizedUser);
      }
    } catch (error) {
      setAccessToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout Function
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore errors during logout
    } finally {
      // Requirement: Set Access Token to null on logout
      setAccessToken(null);
      setUser(null);
      clearSensitiveData();
      setLoading(false);
    }
  }, []);

  // Manual Refresh Function (exposed to context if needed)
  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await authAPI.refreshToken();
      if (response.accessToken) {
        setAccessToken(response.accessToken);
        return response.accessToken;
      }
    } catch (error) {
      setAccessToken(null);
      setUser(null);
      throw error;
    }
  }, []);

  // Helper to get current token
  const getToken = useCallback(() => accessToken, [accessToken]);

  // Derived State
  const isAuthenticated = useMemo(() => {
    return !!accessToken && !!user;
  }, [accessToken, user]);

  const value = {
    user,
    accessToken,
    loading,
    login,
    logout,
    refreshAccessToken,
    getToken,
    isAuthenticated,
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

export default AuthContext;
