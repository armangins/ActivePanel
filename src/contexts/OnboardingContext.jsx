import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { checkOnboardingStatus, markOnboardingComplete, resetOnboarding as resetOnboardingService } from '../services/onboarding';
import { getOnboardingStepsWithSettings } from '../config/onboardingSteps';
import { useLanguage } from './LanguageContext';
import { useSettings } from './SettingsContext';
import { secureLog } from '../utils/logger';

const OnboardingContext = createContext(null);

export const OnboardingProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const { settings, loading: settingsLoading } = useSettings();
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  // Check if settings are configured
  const hasSettings = settings && settings.hasConsumerKey && settings.hasConsumerSecret;

  // Get onboarding steps based on settings status
  const onboardingSteps = getOnboardingStepsWithSettings(t, hasSettings);

  // Check onboarding status when user becomes authenticated and settings are loaded
  useEffect(() => {
    const checkStatus = async () => {
      // Wait for settings to load before checking onboarding
      if (isAuthenticated && !hasCheckedOnboarding && !settingsLoading) {
        try {
          // In development mode, always run onboarding regardless of completion status
          const isDevelopment = import.meta.env.DEV;
          
          if (isDevelopment) {
            // Always start tour in development
            setTimeout(() => {
              setIsOnboardingActive(true);
              setRun(true);
            }, 1500);
            setHasCheckedOnboarding(true);
            return;
          }

          // In production, check if user has completed onboarding
          const completed = await checkOnboardingStatus();
          
          // If user hasn't completed onboarding, start the tour
          // Check both API response and user object
          const userCompleted = user?.onboardingCompleted === true;
          
          if (!completed && !userCompleted) {
            // Small delay to ensure UI is ready
            setTimeout(() => {
              setIsOnboardingActive(true);
              setRun(true);
            }, 1500);
          }
          
          setHasCheckedOnboarding(true);
        } catch (error) {
          secureLog.error('Error checking onboarding status:', error);
          setHasCheckedOnboarding(true);
        }
      }
    };

    checkStatus();
  }, [isAuthenticated, user, hasCheckedOnboarding, settingsLoading]);

  const startOnboarding = useCallback(() => {
    setIsOnboardingActive(true);
    setRun(true);
    setStepIndex(0);
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await markOnboardingComplete();
      setIsOnboardingActive(false);
      setRun(false);
      setStepIndex(0);
    } catch (error) {
      secureLog.error('Error completing onboarding:', error);
    }
  }, []);

  const skipOnboarding = useCallback(async () => {
    // Mark as complete when skipped
    await completeOnboarding();
  }, [completeOnboarding]);

  const resetOnboarding = useCallback(async () => {
    try {
      await resetOnboardingService();
      setIsOnboardingActive(false);
      setRun(false);
      setStepIndex(0);
      setHasCheckedOnboarding(false);
      // Restart after a short delay
      setTimeout(() => {
        startOnboarding();
      }, 500);
    } catch (error) {
      secureLog.error('Error resetting onboarding:', error);
    }
  }, [startOnboarding]);

  const handleStepChange = useCallback((data) => {
    setStepIndex(data.index);
  }, []);

  const handleComplete = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const handleSkip = useCallback(() => {
    skipOnboarding();
  }, [skipOnboarding]);

  const value = {
    isOnboardingActive,
    run,
    stepIndex,
    onboardingSteps,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    handleStepChange,
    handleComplete,
    handleSkip,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
