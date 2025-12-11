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

import { loginSchema } from '../schemas/auth';

/**
 * Validate login form inputs
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateLoginForm = (email, password) => {
  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    return {
      isValid: false,
      error: result.error.issues[0].message,
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
  // Rate limiting is handled by the backend
  return { allowed: true, error: null };
};

/**
 * Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object
 */
export const authenticateUser = async (email, password) => {
  const result = await authAPI.login(email, password);
  return result.user;
};








