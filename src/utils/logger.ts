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
const isSensitive = (key: string | number | symbol, value: any): boolean => {
    const keyStr = String(key).toLowerCase();
    const valueStr = String(value).toLowerCase();

    return SENSITIVE_PATTERNS.some(pattern =>
        pattern.test(keyStr) || pattern.test(valueStr)
    );
};

/**
 * Sanitize an object by removing sensitive fields
 */
const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized: any = Array.isArray(obj) ? [] : {};

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

interface ErrorInfo {
    message: string;
    stack?: string;
    [key: string]: any;
}

/**
 * Secure logger - only logs in development and sanitizes sensitive data
 */
export const secureLog = {
    /**
     * Log info (development only)
     */
    info: (...args: any[]): void => {
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
    warn: (...args: any[]): void => {
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
    error: (message: string, error: any = null): void => {
        if (import.meta.env.DEV) {
            if (error) {
                // Only log error message, not full error object
                const errorInfo: ErrorInfo = {
                    message: error.message || String(error),
                    // Don't log stack trace in production (redundant check since we are inside if DEV, but good practice)
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
    debug: (...args: any[]): void => {
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
export const isLoggingEnabled = (): boolean => import.meta.env.DEV;
