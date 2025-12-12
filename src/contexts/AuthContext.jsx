import { createContext, useContext, useState, useEffect } from 'react';
import { sanitizeInput } from '../utils/security';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let pollAttempts = 0;
    const MAX_POLL_ATTEMPTS = 10; // Maximum 10 polling attempts (20 seconds total)
    let intervalId = null;
    let timeoutId = null;

    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        // Try to get user from backend
        try {
          const currentUser = await authAPI.getCurrentUser();
          if (isMounted) {
            setUser(currentUser);
            setLoading(false);
          }
        } catch (error) {
          // Not authenticated or backend not available
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        // Ensure user is set to null on any unexpected error
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Add a timeout fallback to ensure loading never stays true forever
    timeoutId = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    // Poll for authentication only after OAuth redirect (limited attempts)
    // This helps catch cases where user comes back from OAuth but session check hasn't completed
    intervalId = setInterval(async () => {
      pollAttempts++;
      
      // Stop polling after max attempts or if user is authenticated
      if (pollAttempts >= MAX_POLL_ATTEMPTS) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        return;
      }

      // Only poll if not authenticated and not loading
      if (isMounted && !user && !loading) {
        try {
          const currentUser = await authAPI.getCurrentUser();
          if (currentUser && isMounted) {
            setUser(currentUser);
            // Stop polling once authenticated
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        } catch (error) {
          // Not authenticated, continue checking (but limited attempts)
          // Don't log errors to avoid spam
        }
      } else if (user) {
        // User is authenticated, stop polling
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    }, 2000); // Check every 2 seconds (max 10 attempts = 20 seconds)

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); // Empty dependency array - only run on mount

  const login = async (userData) => {
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
      name: sanitizeInput(userData.name || ''),
      picture: pictureUrl, // Use validated picture URL or null
      role: userData.role || 'user',
      provider: userData.provider || 'email',
    };

    // NEVER store password or sensitive data
    delete sanitizedUserData.password;
    delete sanitizedUserData.token;
    delete sanitizedUserData.secret;

    setUser(sanitizedUserData);
  };

  const logout = async () => {
    // Call backend logout
    try {
      const response = await authAPI.logout();
    } catch (error) {
      // Continue even if logout fails
    }

    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
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

