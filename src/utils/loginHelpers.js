/**
 * Login Helper Functions
 * 
 * Utility functions for handling email/password login logic,
 * including validation, rate limiting checks, and authentication flow.
 */

import { checkRateLimit } from './security';
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

// Rate limiting store for login attempts
// Tracks failed attempts per email/IP combination
const loginAttemptsStore = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const INITIAL_BACKOFF_MS = 1000; // 1 second
const MAX_BACKOFF_MS = 5 * 60 * 1000; // 5 minutes
const BACKOFF_MULTIPLIER = 2;

/**
 * Record a failed login attempt
 * @param {string} email - User email
 */
export const recordFailedLoginAttempt = (email) => {
  const now = Date.now();
  const key = email.toLowerCase().trim();
  const record = loginAttemptsStore.get(key) || {
    count: 0,
    resetTime: now + WINDOW_MS,
    backoffUntil: 0
  };

  record.count++;
  record.resetTime = now + WINDOW_MS;

  // Calculate exponential backoff
  const backoffDelay = Math.min(
    INITIAL_BACKOFF_MS * Math.pow(BACKOFF_MULTIPLIER, record.count - 1),
    MAX_BACKOFF_MS
  );
  record.backoffUntil = now + backoffDelay;

  loginAttemptsStore.set(key, record);
};

/**
 * Clear failed login attempts for an email (on successful login)
 * @param {string} email - User email
 */
export const clearFailedLoginAttempts = (email) => {
  const key = email.toLowerCase().trim();
  loginAttemptsStore.delete(key);
};

/**
 * Check rate limiting for login attempts with exponential backoff
 * @param {string} email - User email
 * @returns {Object} { allowed: boolean, error: string|null, remaining?: number, retryAfter?: number }
 */
export const checkLoginRateLimit = (email) => {
  const now = Date.now();
  const key = email.toLowerCase().trim();
  const record = loginAttemptsStore.get(key);

  if (!record) {
    return { allowed: true, error: null };
  }

  // Check if window has expired
  if (now > record.resetTime) {
    loginAttemptsStore.delete(key);
    return { allowed: true, error: null };
  }

  // Check if we're in backoff period
  if (now < record.backoffUntil) {
    const retryAfter = Math.ceil((record.backoffUntil - now) / 1000);
    return {
      allowed: false,
      error: `Too many failed attempts. Please wait ${retryAfter} seconds before trying again.`,
      retryAfter
    };
  }

  // Check if max attempts reached
  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return {
      allowed: false,
      error: `Too many failed login attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
      retryAfter
    };
  }

  return {
    allowed: true,
    error: null,
    remaining: MAX_ATTEMPTS - record.count
  };
};

/**
 * Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object
 */
export const authenticateUser = async (email, password) => {
  const result = await authAPI.login(email, password);

  // Return both user and accessToken for JWT authentication
  return {
    user: result.user,
    accessToken: result.accessToken
  };
};
















