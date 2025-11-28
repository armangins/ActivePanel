import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { validateCSRF, generateCSRFToken } from '../middleware/csrf.js';

const router = express.Router();

// Generate CSRF token for all auth routes
router.use(generateCSRFToken);

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      type: 'refresh',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    }
  );
};

/**
 * POST /api/auth/register
 * Register new user
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().isLength({ min: 2 }),
    validateCSRF,
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      const user = await User.create({
        email,
        password,
        name,
        role: 'user',
        provider: 'email',
      });

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      // Set HTTP-only cookies
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAME_SITE || 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAME_SITE || 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(201).json({
        user,
        token, // Also send in response for frontend storage if needed
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validateCSRF,
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.verifyPassword(email, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      // Set HTTP-only cookies
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAME_SITE || 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAME_SITE || 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.json({
        user,
        token, // Also send in response
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

/**
 * POST /api/auth/google
 * Google OAuth login/signup
 */
router.post(
  '/google',
  [
    body('credential').notEmpty(),
    validateCSRF,
  ],
  async (req, res) => {
    try {
      const { credential } = req.body;

      // Verify Google token (simplified - use google-auth-library in production)
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const userData = JSON.parse(jsonPayload);

      // Find or create user
      let user = await User.findByEmail(userData.email);
      
      if (!user) {
        user = await User.create({
          email: userData.email,
          password: crypto.randomBytes(32).toString('hex'), // Random password for OAuth users
          name: userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim(),
          picture: userData.picture,
          role: 'user',
          provider: 'google',
        });
      }

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      // Set HTTP-only cookies
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAME_SITE || 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAME_SITE || 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        user,
        token,
      });
    } catch (error) {
      res.status(400).json({ error: 'Google authentication failed' });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies['refresh-token'];
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SAME_SITE || 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authenticate, (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refresh-token');
  res.clearCookie('csrf-token');
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;

