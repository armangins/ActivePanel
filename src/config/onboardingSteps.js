/**
 * Get onboarding steps based on whether settings are configured
 */
export const getOnboardingStepsWithSettings = (t, hasSettings) => {
  const steps = [];

  // First step: Settings setup (most important)
  if (!hasSettings) {
    steps.push({
      target: '[data-onboarding="settings-nav"]',
      content: t('onboardingSettingsRequired') || 'חשוב! לפני שתתחיל, עליך להגדיר את חיבור WooCommerce שלך. לחץ על "הגדרות" כדי להתחיל.',
      placement: 'right',
      disableBeacon: true,
      spotlightClicks: false,
      disableScrolling: false,
    });
  } else {
    // If settings are configured, show welcome first, then settings
    steps.push({
      target: 'body',
      content: t('onboardingWelcome') || 'ברוכים הבאים ל-ActivePanel! בואו נתחיל בסיור קצר כדי להכיר את המערכת.',
      placement: 'center',
      disableBeacon: true,
      disableOverlayClose: true,
      spotlightClicks: false,
    });
    steps.push({
      target: '[data-onboarding="settings-nav"]',
      content: t('onboardingSettings') || 'כאן תוכל להגדיר את כל ההגדרות של המערכת, כולל חיבור WooCommerce.',
      placement: 'right',
      disableBeacon: false,
    });
  }

  // Add welcome step if settings are not configured (after settings step)
  if (!hasSettings) {
    steps.push({
      target: 'body',
      content: t('onboardingWelcome') || 'ברוכים הבאים ל-ActivePanel! בואו נתחיל בסיור קצר כדי להכיר את המערכת.',
      placement: 'center',
      disableBeacon: false,
      disableOverlayClose: true,
      spotlightClicks: false,
    });
  }

  // Add dashboard step
  steps.push({
    target: '[data-onboarding="dashboard-header"]',
    content: t('onboardingDashboard') || 'זהו לוח הבקרה שלך. כאן תוכל לראות סטטיסטיקות כלליות על העסק שלך - הכנסות, הזמנות, לקוחות ומוצרים.',
    placement: 'bottom',
    disableBeacon: false,
  });

  // Add remaining steps
  steps.push(
    {
      target: '[data-onboarding="products-nav"]',
      content: t('onboardingProducts') || 'כאן תוכל לנהל את כל המוצרים שלך - להוסיף, לערוך ולמחוק מוצרים.',
      placement: 'right',
      disableBeacon: false,
    },
    {
      target: '[data-onboarding="orders-nav"]',
      content: t('onboardingOrders') || 'בדף ההזמנות תוכל לראות ולנהל את כל ההזמנות מהחנות שלך.',
      placement: 'right',
      disableBeacon: false,
    },
    {
      target: 'body',
      content: t('onboardingComplete') || 'מעולה! עכשיו אתה מוכן להתחיל. זכור: אתה תמיד יכול לחזור לסיור הזה מההגדרות.',
      placement: 'center',
      disableBeacon: false,
    }
  );
  
  return steps;
};
