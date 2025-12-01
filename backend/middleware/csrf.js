import crypto from 'crypto';

/**
 * CSRF Protection Middleware
 * Generates and validates CSRF tokens
 */

// In-memory store for CSRF tokens (use Redis in production)
const csrfTokens = new Map();

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (req, res, next) => {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(token, {
    createdAt: Date.now(),
    ip: req.ip,
  });
  
  // Set token in HTTP-only cookie
  res.cookie('csrf-token', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'strict',
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  
  // Also send in response header for frontend to read
  res.setHeader('X-CSRF-Token', token);
  
  next();
};

/**
 * Validate CSRF token
 */
export const validateCSRF = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const cookieToken = req.cookies['csrf-token'];
  
  if (!token || !cookieToken || token !== cookieToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  // Check if token exists in store
  const tokenData = csrfTokens.get(token);
  if (!tokenData) {
    return res.status(403).json({ error: 'CSRF token expired or invalid' });
  }
  
  // Optional: Check IP address matches
  if (tokenData.ip !== req.ip) {
    // Log suspicious activity but allow (in case of proxy)
    console.warn('CSRF token IP mismatch:', tokenData.ip, req.ip);
  }
  
  // Clean up old tokens (older than 1 hour)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [t, data] of csrfTokens.entries()) {
    if (data.createdAt < oneHourAgo) {
      csrfTokens.delete(t);
    }
  }
  
  next();
};




