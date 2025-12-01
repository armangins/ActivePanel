/**
 * Login Helper Functions
 * 
 * Utility functions for handling email/password login logic,
 * including validation, rate limiting checks, and authentication flow.
 */

import { checkRateLimit } from './security';
import { authenticateWithEmail } from '../services/auth';
import { authAPI } from '../services/api';

const USE_BACKEND_API = import.meta.env.VITE_API_URL;

/**
 * Validate login form inputs
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateLoginForm = (email, password) => {
  if (!email || !password) {
    return {
      isValid: false,
      error: 'אנא מלא את כל השדות',
    };
  }
  return { isValid: true, error: null };
};

/**
 * Check rate limiting for login attempts
 * @param {string} email - User email
 * @returns {Object} { allowed: boolean, error: string|null }
 */
export const checkLoginRateLimit = (email) => {
  if (USE_BACKEND_API) {
    // Rate limiting handled by backend
    return { allowed: true, error: null };
  }

  const rateLimit = checkRateLimit(`login_${email}`, 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    const minutesRemaining = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
    return {
      allowed: false,
      error: `יותר מדי ניסיונות התחברות. אנא נסה שוב בעוד ${minutesRemaining} דקות.`,
    };
  }
  return { allowed: true, error: null };
};

/**
 * Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object
 */
export const authenticateUser = async (email, password) => {
  if (USE_BACKEND_API) {
    // Use backend API
    const result = await authAPI.login(email, password);
    return result.user;
  } else {
    // Fallback to localStorage (demo mode)
    return await authenticateWithEmail(email, password);
  }
};




