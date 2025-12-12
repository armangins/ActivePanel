import { useEffect, useRef } from 'react';

/**
 * Custom hook for automatic JWT token refresh
 * 
 * Automatically refreshes the access token before it expires
 * to maintain user session without interruption.
 * 
 * @param {string|null} accessToken - Current access token
 * @param {Function} refreshAccessToken - Function to refresh the token
 * @param {number} refreshInterval - Interval in milliseconds (default: 14 minutes)
 */
const useTokenRefresh = (accessToken, refreshAccessToken, refreshInterval = 14 * 60 * 1000) => {
    const intervalRef = useRef(null);

    useEffect(() => {
        // Only set up auto-refresh if we have an access token
        if (!accessToken) {
            // Clear any existing interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Set up automatic token refresh
        intervalRef.current = setInterval(async () => {
            try {
                await refreshAccessToken();
            } catch (error) {
                // Refresh failed - error handling is done in refreshAccessToken
                console.error('[useTokenRefresh] Auto-refresh failed:', error.message);
            }
        }, refreshInterval);

        // Cleanup on unmount or when token changes
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [accessToken, refreshAccessToken, refreshInterval]);
};

export default useTokenRefresh;
