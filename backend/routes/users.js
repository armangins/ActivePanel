import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { validateCSRF } from '../middleware/csrf.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get('/me', async (req, res) => {
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

/**
 * PUT /api/users/me
 * Update current user profile
 */
router.put('/me', validateCSRF, async (req, res) => {
  try {
    const { name, picture } = req.body;
    
    const user = await User.update(req.user.id, {
      name,
      picture,
    });
    
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

