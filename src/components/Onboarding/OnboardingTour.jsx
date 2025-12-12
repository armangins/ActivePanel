import { useEffect } from 'react';
import Joyride, { STATUS, EVENTS } from 'react-joyride';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * OnboardingTour Component
 * Wraps react-joyride with custom styling and RTL support
 */
const OnboardingTour = () => {
  const {
    run,
    stepIndex,
    onboardingSteps,
    handleStepChange,
    handleComplete,
    handleSkip,
  } = useOnboarding();
  const { isRTL } = useLanguage();

  // Add highlight class to target element when step is active
  useEffect(() => {
    if (!run || !onboardingSteps || onboardingSteps.length === 0 || stepIndex === undefined) {
      return;
    }

    const currentStep = onboardingSteps[stepIndex];
    if (!currentStep?.target || currentStep.target === 'body') {
      return;
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      try {
        const targetElement = document.querySelector(currentStep.target);
        if (targetElement) {
          targetElement.classList.add('onboarding-highlight');
        }
      } catch (error) {
        // Silently fail - don't break the component
      }
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      try {
        if (currentStep?.target) {
          const targetElement = document.querySelector(currentStep.target);
          if (targetElement) {
            targetElement.classList.remove('onboarding-highlight');
          }
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, [run, stepIndex, onboardingSteps]);

  // Handle step changes
  const handleJoyrideCallback = (data) => {
    const { status, type, index, action } = data;

    // Handle completion or skip
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      handleComplete();
      return;
    }

    // Update step index when step changes
    if (index !== undefined && index !== stepIndex) {
      handleStepChange({ index });
    }
  };

  // Custom styles for RTL and Hebrew support
  const joyrideStyles = {
    options: {
      primaryColor: '#4560FF',
      textColor: '#1F2937',
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      arrowColor: '#ffffff',
      backgroundColor: '#ffffff',
      spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
      zIndex: 10000,
    },
    tooltip: {
      borderRadius: '8px',
      fontSize: '16px',
      padding: '20px',
      direction: isRTL ? 'rtl' : 'ltr',
      textAlign: isRTL ? 'right' : 'left',
    },
    tooltipContainer: {
      textAlign: isRTL ? 'right' : 'left',
      direction: isRTL ? 'rtl' : 'ltr',
    },
    tooltipTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    tooltipContent: {
      padding: '10px 0',
      fontSize: '16px',
      lineHeight: '1.6',
    },
    tooltipFooter: {
      display: 'flex',
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '15px',
      gap: '10px',
    },
    buttonNext: {
      backgroundColor: '#4560FF',
      color: '#ffffff',
      borderRadius: '6px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      order: isRTL ? 2 : 1,
    },
    buttonBack: {
      color: '#6B7280',
      fontSize: '14px',
      order: isRTL ? 1 : 2,
    },
    buttonSkip: {
      color: '#6B7280',
      fontSize: '14px',
      order: isRTL ? 1 : 0,
      marginRight: isRTL ? 'auto' : '0',
      marginLeft: isRTL ? '0' : 'auto',
    },
    spotlight: {
      borderRadius: '8px',
      mixBlendMode: 'normal',
    },
    spotlightOverlay: {
      fill: 'white',
    },
    overlay: {
      mixBlendMode: 'normal',
    },
  };

  if (!run || onboardingSteps.length === 0) {
    return null;
  }

  // Get total steps count for Hebrew progress text
  const totalSteps = onboardingSteps.length;
  const currentStepNumber = stepIndex + 1;

  return (
    <>
      {/* Custom CSS to position buttons - Skip on left, Next on right */}
      <style>{`
        /* Position buttons - Skip on left, Next on right with space between */
        .react-joyride__tooltip footer {
          display: flex !important;
          flex-direction: row-reverse !important;
          justify-content: space-between !important;
          direction: rtl !important;
        }
        
        /* Ensure buttons are clickable */
        .react-joyride__tooltip button {
          pointer-events: auto !important;
          cursor: pointer !important;
        }
        
        /* Show progress indicators */
        .react-joyride__tooltip .react-joyride__progress {
          display: block !important;
        }
        
        /* Ensure sidebar items stay visible above spotlight */
        .react-joyride__spotlight {
          pointer-events: none !important;
          border: 3px solid #4560FF !important;
          border-radius: 8px !important;
          box-shadow: 0 0 0 4px rgba(69, 96, 255, 0.2), 0 0 20px rgba(69, 96, 255, 0.4) !important;
        }
        
        /* Make sure sidebar menu items are clickable and visible */
        [data-onboarding="settings-nav"],
        .sidebar-menu-item {
          position: relative !important;
          z-index: 10001 !important;
          pointer-events: auto !important;
        }
        
        /* Highlight the target element when it's being shown in onboarding */
        [data-onboarding="settings-nav"] {
          transition: all 0.3s ease !important;
        }
        
        /* When react-joyride targets an element, it adds a class - highlight it */
        body:has(.react-joyride__spotlight) [data-onboarding="settings-nav"] {
          background-color: #EBF3FF !important;
          border: 2px solid #4560FF !important;
          border-radius: 8px !important;
          box-shadow: 0 0 0 2px rgba(69, 96, 255, 0.3), 0 4px 12px rgba(69, 96, 255, 0.2) !important;
          transform: scale(1.02) !important;
        }
        
        /* Alternative: Use attribute selector when element is in spotlight */
        .react-joyride__target[data-onboarding="settings-nav"],
        .react-joyride__target [data-onboarding="settings-nav"] {
          background-color: #EBF3FF !important;
          border: 2px solid #4560FF !important;
          border-radius: 8px !important;
          box-shadow: 0 0 0 2px rgba(69, 96, 255, 0.3), 0 4px 12px rgba(69, 96, 255, 0.2) !important;
        }
        
        /* Highlight class added via JavaScript */
        .onboarding-highlight {
          background-color: #EBF3FF !important;
          border: 2px solid #4560FF !important;
          border-radius: 8px !important;
          box-shadow: 0 0 0 2px rgba(69, 96, 255, 0.3), 0 4px 12px rgba(69, 96, 255, 0.2) !important;
          animation: pulse-highlight 2s ease-in-out infinite !important;
        }
        
        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 2px rgba(69, 96, 255, 0.3), 0 4px 12px rgba(69, 96, 255, 0.2) !important;
          }
          50% {
            box-shadow: 0 0 0 4px rgba(69, 96, 255, 0.4), 0 6px 16px rgba(69, 96, 255, 0.3) !important;
          }
        }
      `}</style>
      <Joyride
        steps={onboardingSteps}
        run={run}
        continuous
        showProgress={false}
        showSkipButton
        disableOverlayClose
        disableScrolling={false}
        styles={joyrideStyles}
        locale={{
          back: 'חזור',
          close: 'סגור',
          last: 'סיום',
          next: 'הבא',
          skip: 'דלג',
        }}
        callback={handleJoyrideCallback}
        floaterProps={{
          disableAnimation: false,
          placement: 'auto',
        }}
      />
    </>
  );
};

export default OnboardingTour;
