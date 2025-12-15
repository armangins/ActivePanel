/**
 * Secure Logger Utility
 * 
 * Provides secure logging that:
 * - Only logs in development mode
 * - Never logs sensitive data (passwords, tokens, secrets)
 * - Sanitizes error messages
 */

const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /key/i,
  /credential/i,
  /auth/i,
];

/**
 * Check if a key or value contains sensitive information
 */
const isSensitive = (key, value) => {
  const keyStr = String(key).toLowerCase();
  const valueStr = String(value).toLowerCase();
  
  return SENSITIVE_PATTERNS.some(pattern => 
    pattern.test(keyStr) || pattern.test(valueStr)
  );
};

/**
 * Sanitize an object by removing sensitive fields
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitive(key, value)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Secure logger - only logs in development and sanitizes sensitive data
 */
export const secureLog = {
  /**
   * Log info (development only)
   */
  info: (...args) => {
    if (import.meta.env.DEV) {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeObject(arg) : arg
      );
      console.log('[INFO]', ...sanitized);
    }
  },
  
  /**
   * Log warning (development only)
   */
  warn: (...args) => {
    if (import.meta.env.DEV) {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeObject(arg) : arg
      );
      console.warn('[WARN]', ...sanitized);
    }
  },
  
  /**
   * Log error (development only, sanitized)
   */
  error: (message, error = null) => {
    if (import.meta.env.DEV) {
      if (error) {
        // Only log error message, not full error object
        const errorInfo = {
          message: error.message || String(error),
          // Don't log stack trace in production
          ...(import.meta.env.DEV ? { stack: error.stack } : {}),
        };
        console.error('[ERROR]', message, sanitizeObject(errorInfo));
      } else {
        console.error('[ERROR]', message);
      }
    }
  },
  
  /**
   * Log debug info (development only)
   */
  debug: (...args) => {
    if (import.meta.env.DEV) {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeObject(arg) : arg
      );
      console.debug('[DEBUG]', ...sanitized);
    }
  },
};

/**
 * Check if logging is enabled (development mode)
 */
export const isLoggingEnabled = () => import.meta.env.DEV;













