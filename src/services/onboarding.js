import { api, onboardingAPI } from './api';
import { secureLog } from '../utils/logger';

const ONBOARDING_STORAGE_KEY = 'onboarding_completed';

/**
 * Check if user has completed onboarding
 * Checks both API response and localStorage as fallback
 */
export const checkOnboardingStatus = async () => {
  try {
    // First check localStorage for quick response
    const localCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (localCompleted === 'true') {
      return true;
    }

    // Check API for authoritative answer
    const response = await api.get('/auth/me');
    const user = response.data?.user;
    
    if (user?.onboardingCompleted) {
      // Sync to localStorage
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      return true;
    }

    return false;
  } catch (error) {
    // If API fails, fall back to localStorage
    const localCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return localCompleted === 'true';
  }
};

/**
 * Mark onboarding as completed
 * Updates both database and localStorage
 */
export const markOnboardingComplete = async () => {
  try {
    // Update localStorage immediately for instant feedback
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');

    // Update database
    await onboardingAPI.complete();
    
    return true;
  } catch (error) {
    secureLog.error('Failed to mark onboarding as complete:', error);
    // Keep localStorage update even if API fails
    return false;
  }
};

/**
 * Reset onboarding (allow restart)
 * Clears both database and localStorage
 */
export const resetOnboarding = async () => {
  try {
    // Clear localStorage
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);

    // Note: We don't have a reset endpoint, so we'll just clear localStorage
    // The user will need to manually update the database if needed
    // Or we can add a reset endpoint later if needed
    
    return true;
  } catch (error) {
    secureLog.error('Failed to reset onboarding:', error);
    return false;
  }
};
