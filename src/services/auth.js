import { authAPI } from './api';

// Authenticate user with email and password
export const authenticateWithEmail = async (email, password) => {
  const response = await authAPI.login(email, password);
  return response.user;
};

// Register new user
export const registerUser = async (email, password, name) => {
  const response = await authAPI.register(email, password, name);
  return response.user;
};

