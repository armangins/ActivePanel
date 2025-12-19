/**
 * Security Utilities
 * 
 * Provides security functions for data protection
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  // Use DOMPurify for robust sanitization of simple text
  return DOMPurify.sanitize(input).trim();
};

/**
 * Sanitize HTML content for safe rendering
 * Used when dangerouslySetInnerHTML is absolutely necessary
 * @param {string} content - HTML content
 * @returns {string} Sanitized HTML
 */
export const sanitizeHTML = (content) => {
  if (!content) return '';

  if (typeof content !== 'string') return content;

  return DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true }, // Only allow HTML
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'style', 'input', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout'],
    ADD_ATTR: ['target', 'rel'] // Allow links to open in new tab
  });
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase().trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};



/**
 * Rate limiting helper (client-side)
 * Note: Real rate limiting should be implemented on the backend
 */
const rateLimitStore = new Map();

export const checkRateLimit = (key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  rateLimitStore.set(key, record);
  return { allowed: true, remaining: maxAttempts - record.count };
};

/**
 * Clear sensitive data from memory
 */
export const clearSensitiveData = () => {
  // Clear rate limit store
  rateLimitStore.clear();

  // Clear any sensitive variables
  // Note: In JavaScript, we can't force garbage collection,
  // but we can remove references
};

/**
 * Generate secure random token (for client-side use)
 * Note: For production, use crypto.getRandomValues() or backend-generated tokens
 */
export const generateSecureToken = (length = 32) => {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto API
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate image URL
 * Checks if the URL is valid and uses allowed protocols (http, https)
 * @param {string} url - The URL to validate
 * @returns {string|null} The validated URL or null if invalid
 */
export const validateImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  try {
    const parsedUrl = new URL(url);
    // Allow http, https, and data URIs for images
    if (['http:', 'https:', 'data:'].includes(parsedUrl.protocol)) {
      // Basic XSS prevention: avoid javascript: protocol (already handled by protocol check but good practice)
      return DOMPurify.sanitize(url);
    }
    return null;
  } catch (error) {
    // Check if it's a relative path which might be valid for local assets
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return DOMPurify.sanitize(url);
    }
    return null;
  }
};
