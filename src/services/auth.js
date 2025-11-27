// Authentication service
// Note: This is a basic implementation for demo purposes
// In production, this should connect to a backend API

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

// Get all users from storage
const getUsers = () => {
  initializeDefaultUsers();
  const users = localStorage.getItem(AUTH_STORAGE_KEY);
  return users ? JSON.parse(users) : [];
};

// Save users to storage
const saveUsers = (users) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
};

// Authenticate user with email and password
export const authenticateWithEmail = async (email, password) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getUsers();
  // Allow both exact match and lowercase comparison
  const user = users.find(
    (u) => (u.email.toLowerCase() === email.toLowerCase() || u.email === email) && u.password === password
  );

  if (!user) {
    throw new Error('אימייל או סיסמה שגויים');
  }

  // Return user data (without password)
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    picture: null,
  };
};

// Register new user (for future use)
export const registerUser = async (email, password, name) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getUsers();
  
  // Check if user already exists
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('משתמש עם אימייל זה כבר קיים');
  }

  const newUser = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    password, // In production, this should be hashed
    name,
    role: 'user',
  };

  users.push(newUser);
  saveUsers(users);

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    picture: null,
  };
};

// Initialize default users on module load
initializeDefaultUsers();

