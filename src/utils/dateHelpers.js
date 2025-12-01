/**
 * Date Helper Utilities
 * 
 * Utility functions for formatting and manipulating dates.
 */

/**
 * Format date to relative time (Hebrew)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted relative time string
 */
export const formatRelativeDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  
  return date.toLocaleDateString('he-IL');
};



