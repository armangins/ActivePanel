import { createContext, useContext, useState, useEffect } from 'react';
import { sanitizeInput } from '../utils/security';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        // Try to get user from backend
        try {
          const currentUser = await authAPI.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Not authenticated or backend not available
          setUser(null);
        }
      } catch (error) {
        // Ensure user is set to null on any unexpected error
        setUser(null);
      } finally {
        // Always set loading to false, even if there's an error
        setLoading(false);
      }
    };

    // Add a timeout fallback to ensure loading never stays true forever
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 second timeout

    checkAuth().finally(() => {
      clearTimeout(timeoutId);
    });

    // Also check auth periodically if not authenticated (handles Google OAuth redirect case)
    // This helps catch cases where user comes back from OAuth but session check hasn't completed
    const intervalId = setInterval(async () => {
      if (!user && !loading) {
        try {
          const currentUser = await authAPI.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        } catch (error) {
          // Not authenticated, continue checking
        }
      }
    }, 2000); // Check every 2 seconds if not authenticated

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [user, loading]);

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

