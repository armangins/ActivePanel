import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateCSRF } from '../middleware/csrf.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// All routes require authentication
router.use(authenticate);

const SETTINGS_FILE = path.join(__dirname, '../data/settings.json');

// Load settings
const loadSettings = async (userId) => {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const allSettings = JSON.parse(data);
    return allSettings[userId] || {};
  } catch {
    return {};
  }
};

// Save settings
const saveSettings = async (userId, settings) => {
  let allSettings = {};
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    allSettings = JSON.parse(data);
  } catch {
    // File doesn't exist
  }
  
  allSettings[userId] = settings;
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(allSettings, null, 2), 'utf-8');
};

/**
 * GET /api/settings
 * Get user settings
 */
router.get('/', async (req, res) => {
  try {
    const settings = await loadSettings(req.user.id);
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

/**
 * PUT /api/settings
 * Update user settings
 */
router.put('/', validateCSRF, async (req, res) => {
  try {
    const settings = req.body;
    
    // Don't allow storing sensitive data in plain text
    // In production, encrypt sensitive settings
    await saveSettings(req.user.id, settings);
    
    res.json({ message: 'Settings saved successfully', settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

export default router;




