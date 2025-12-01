/**
 * User Management Utilities
 * 
 * Utilities for managing user data in localStorage,
 * including creation, updates, and retrieval for Google and email users.
 */

// In-memory users storage
let users = [];

/**
 * Get all users from storage
 * @returns {Array} Array of user objects
 */
export const getUsers = () => {
  return users;
};

/**
 * Save users array to storage
 * @param {Array} newUsers - Array of user objects
 */
export const saveUsers = (newUsers) => {
  users = newUsers;
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Object|null} User object or null
 */
export const findUserByEmail = (email) => {
  const users = getUsers();
  return users.find((u) => u.email === email) || null;
};

/**
 * Create or update Google user
 * @param {Object} googleUserData - Decoded Google credential data
 * @returns {Object} User object formatted for application use
 */
export const createOrUpdateGoogleUser = (googleUserData) => {
  const users = getUsers();
  const googlePicture = googleUserData.picture?.trim() || null;

  // Find existing user
  let existingUser = users.find((u) => u.email === googleUserData.email);

  if (!existingUser) {
    // Create new user
    existingUser = {
      id: googleUserData.sub,
      email: googleUserData.email,
      name: googleUserData.name || `${googleUserData.given_name || ''} ${googleUserData.family_name || ''}`.trim(),
      picture: googlePicture,
      role: 'user',
      provider: 'google',
    };
    users.push(existingUser);
  } else {
    // Update existing user with fresh Google data
    existingUser.picture = googlePicture || existingUser.picture;
    existingUser.name = googleUserData.name || existingUser.name;
    const userIndex = users.findIndex((u) => u.email === googleUserData.email);
    if (userIndex !== -1) {
      users[userIndex] = existingUser;
    }
  }

  saveUsers(users);

  // Return formatted user object for authentication
  return {
    id: existingUser.id || googleUserData.sub,
    email: googleUserData.email,
    name: existingUser.name || googleUserData.name,
    picture: googlePicture || existingUser.picture || null,
    given_name: googleUserData.given_name,
    family_name: googleUserData.family_name,
    provider: 'google',
  };
};




