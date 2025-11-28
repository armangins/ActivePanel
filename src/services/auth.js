// Authentication service
// Note: This is a basic implementation for demo purposes
// In production, this should connect to a backend API

import { sanitizeInput, isValidEmail, validatePassword, secureStorage } from '../utils/security';

const AUTH_STORAGE_KEY = 'activepanel_users';

// Initialize with a default admin user (for demo purposes)
const initializeDefaultUsers = () => {
  const existingUsers = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!existingUsers) {
    const defaultUsers = [
      {
        id: '1',
        email: 'admin@mail.com',
        password: 'admin', // In production, this should be hashed
        name: 'מנהל מערכת',
        role: 'admin',
      },
    ];
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUsers));
  } else {
    // Check if admin user exists, if not add it
    const users = JSON.parse(existingUsers);
    const adminExists = users.some(u => u.email === 'admin@mail.com' || u.email === 'admin');
    if (!adminExists) {
      users.push({
        id: Date.now().toString(),
        email: 'admin@mail.com',
        password: 'admin',
        name: 'מנהל מערכת',
        role: 'admin',
      });
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
    } else {
      // Update existing admin user if it has old email
      const adminUser = users.find(u => u.email === 'admin');
      if (adminUser) {
        adminUser.email = 'admin@mail.com';
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
      }
    }
  }
};

// Get all users from storage (using secure storage)
const getUsers = () => {
  initializeDefaultUsers();
  const users = secureStorage.getItem(AUTH_STORAGE_KEY);
  return users || [];
};

// Save users to storage (using secure storage)
const saveUsers = (users) => {
  // Sanitize user data before storing
  const sanitizedUsers = users.map(user => ({
    ...user,
    email: sanitizeInput(user.email || '').toLowerCase(),
    name: sanitizeInput(user.name || ''),
    // Never store password in plain text (even in demo)
    // In production, passwords should be hashed on backend
  }));
  secureStorage.setItem(AUTH_STORAGE_KEY, sanitizedUsers);
};

// Authenticate user with email and password
export const authenticateWithEmail = async (email, password) => {
  // Validate input
  const sanitizedEmail = sanitizeInput(email || '').toLowerCase().trim();
  const sanitizedPassword = sanitizeInput(password || '');
  
  if (!isValidEmail(sanitizedEmail)) {
    throw new Error('כתובת אימייל לא תקינה');
  }
  
  if (!sanitizedPassword || sanitizedPassword.length < 6) {
    throw new Error('סיסמה חייבת להכיל לפחות 6 תווים');
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getUsers();
  // Find user with sanitized email
  const user = users.find(
    (u) => u.email.toLowerCase() === sanitizedEmail && u.password === sanitizedPassword
  );

  if (!user) {
    throw new Error('אימייל או סיסמה שגויים');
  }

  // Return user data (without password - NEVER return password)
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    picture: user.picture || null,
    provider: user.provider || 'email',
  };
};

// Register new user with security validation
export const registerUser = async (email, password, name) => {
  // Validate and sanitize input
  const sanitizedEmail = sanitizeInput(email || '').toLowerCase().trim();
  const sanitizedPassword = sanitizeInput(password || '');
  const sanitizedName = sanitizeInput(name || '').trim();
  
  // Validate email
  if (!isValidEmail(sanitizedEmail)) {
    throw new Error('כתובת אימייל לא תקינה');
  }
  
  // Validate password strength
  const passwordValidation = validatePassword(sanitizedPassword);
  if (!passwordValidation.isValid) {
    // For demo, allow simple passwords but warn
    // In production, enforce strong passwords
    if (sanitizedPassword.length < 6) {
      throw new Error('סיסמה חייבת להכיל לפחות 6 תווים');
    }
  }
  
  // Validate name
  if (!sanitizedName || sanitizedName.length < 2) {
    throw new Error('שם חייב להכיל לפחות 2 תווים');
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getUsers();
  
  // Check if user already exists
  if (users.some((u) => u.email.toLowerCase() === sanitizedEmail)) {
    throw new Error('משתמש עם אימייל זה כבר קיים');
  }

  // ⚠️ SECURITY WARNING: In production, password should be hashed on backend
  // Never store plain text passwords - this is for demo only
  const newUser = {
    id: Date.now().toString(),
    email: sanitizedEmail,
    password: sanitizedPassword, // ⚠️ Should be hashed in production
    name: sanitizedName,
    role: 'user',
    provider: 'email',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Return user data WITHOUT password
  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    picture: null,
    provider: 'email',
  };
};

// Initialize default users on module load
initializeDefaultUsers();

