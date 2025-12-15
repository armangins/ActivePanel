/**
 * Refresh Helper Utilities
 * 
 * Utility functions for handling data refresh operations.
 */
/**
 * Refresh all application data
 * Clears cache and reloads the page
 * @returns {Promise<void>}
 */
export const refreshAllData = async () => {
  try {
    // Cache is cleared by page reload since we removed persistent storage

    // Dispatch refresh event for components to listen to
    window.dispatchEvent(new CustomEvent('dataRefresh'));

    // Reload current page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 300);
  } catch (error) {
    throw error;
  }
};












