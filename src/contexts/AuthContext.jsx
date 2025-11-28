import { createContext, useContext, useState, useEffect } from 'react';
import { secureStorage, sanitizeInput } from '../utils/security';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const USER_STORAGE_KEY = 'activepanel_user_session';
const USE_BACKEND_API = import.meta.env.VITE_API_URL; // Use backend if API_URL is set

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      if (USE_BACKEND_API) {
        // Try to get user from backend
        try {
          const currentUser = await authAPI.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Not authenticated or backend not available
          setUser(null);
        }
      } else {
        // Fallback to localStorage (demo mode)
        const savedUser = secureStorage.getItem(USER_STORAGE_KEY);
        if (savedUser) {
          try {
            const sanitizedUser = {
              ...savedUser,
              email: sanitizeInput(savedUser.email || ''),
              name: sanitizeInput(savedUser.name || ''),
            };
            delete sanitizedUser.password;
            setUser(sanitizedUser);
          } catch (error) {
            secureStorage.removeItem(USER_STORAGE_KEY);
          }
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (userData) => {
    // Sanitize and secure user data before storing
    const sanitizedUserData = {
      id: userData.id,
      email: sanitizeInput(userData.email || ''),
      name: sanitizeInput(userData.name || ''),
      picture: userData.picture || null,
      role: userData.role || 'user',
      provider: userData.provider || 'email',
    };
    
    // NEVER store password or sensitive data
    delete sanitizedUserData.password;
    delete sanitizedUserData.token;
    delete sanitizedUserData.secret;
    
    setUser(sanitizedUserData);
    
    // Store in localStorage as backup (for demo mode or if backend unavailable)
    secureStorage.setItem(USER_STORAGE_KEY, sanitizedUserData);
  };

  const logout = async () => {
    // Call backend logout if using backend API
    if (USE_BACKEND_API) {
      try {
        await authAPI.logout();
      } catch (error) {
        // Continue even if logout fails
      }
    }
    
    setUser(null);
    secureStorage.removeItem(USER_STORAGE_KEY);
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

