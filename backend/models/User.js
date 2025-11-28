import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple file-based storage (use database in production)
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const ensureDataDir = async () => {
  const dataDir = path.dirname(USERS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Load users from file
const loadUsers = async () => {
  await ensureDataDir();
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // File doesn't exist, return empty array
    return [];
  }
};

// Save users to file
const saveUsers = async (users) => {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
};

/**
 * User Model
 */
class User {
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const users = await loadUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const users = await loadUsers();
    return users.find(u => u.id === id);
  }

  /**
   * Create new user
   */
  static async create(userData) {
    const users = await loadUsers();
    
    // Check if user already exists
    const existing = await this.findByEmail(userData.email);
    if (existing) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser = {
      id: Date.now().toString(),
      email: userData.email.toLowerCase(),
      password: hashedPassword, // Hashed password
      name: userData.name,
      role: userData.role || 'user',
      provider: userData.provider || 'email',
      picture: userData.picture || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    await saveUsers(users);
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Verify password
   */
  static async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user
   */
  static async update(id, updates) {
    const users = await loadUsers();
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) {
      throw new Error('User not found');
    }
    
    // Don't allow password updates through this method
    delete updates.password;
    
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await saveUsers(users);
    
    const { password, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  }

  /**
   * Initialize default admin user
   */
  static async initializeDefaultAdmin() {
    const users = await loadUsers();
    const adminExists = users.some(u => u.email === 'admin@mail.com');
    
    if (!adminExists) {
      await this.create({
        email: 'admin@mail.com',
        password: 'admin', // Will be hashed
        name: 'מנהל מערכת',
        role: 'admin',
      });
      console.log('✅ Default admin user created: admin@mail.com / admin');
    }
  }
}

// Initialize default admin on module load
User.initializeDefaultAdmin().catch(console.error);

export default User;

