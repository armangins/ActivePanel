/**
 * Cache Service
 * 
 * Provides caching functionality using localStorage with expiration.
 * Helps improve app performance by caching API responses.
 */

const CACHE_PREFIX = 'woocommerce_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

/**
 * Generate cache key from endpoint and params
 */
const generateCacheKey = (endpoint, params = {}) => {
  const paramsString = JSON.stringify(params);
  return `${CACHE_PREFIX}${endpoint}_${btoa(paramsString)}`;
};

/**
 * Get cached data if it exists and hasn't expired
 */
export const getCachedData = (endpoint, params = {}, ttl = DEFAULT_TTL) => {
  try {
    const cacheKey = generateCacheKey(endpoint, params);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return null;
    }
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    const age = now - timestamp;
    
    // Check if cache is still valid
    if (age > ttl) {
      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    // ⚠️ SECURITY: Never log full error objects
    // Only log in development
    if (import.meta.env.DEV) {
      // Log only error message
    }
    return null;
  }
};

/**
 * Set data in cache with timestamp
 */
export const setCachedData = (endpoint, params = {}, data) => {
  try {
    const cacheKey = generateCacheKey(endpoint, params);
    const cacheValue = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheValue));
  } catch (error) {
    // ⚠️ SECURITY: Never log full error objects
    // Only log in development
    if (import.meta.env.DEV) {
      // Log only error message
    }
    // If storage is full, try to clear old cache entries
    if (error.name === 'QuotaExceededError') {
      clearOldCache();
      // Retry once
      try {
        const cacheKey = generateCacheKey(endpoint, params);
        const cacheValue = {
          data,
          timestamp: Date.now(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheValue));
      } catch (retryError) {
        console.error('Failed to cache after cleanup:', retryError);
      }
    }
  }
};

/**
 * Clear expired cache entries
 */
const clearOldCache = () => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let cleared = 0;
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { timestamp } = JSON.parse(cached);
            // Remove entries older than 1 hour
            if (now - timestamp > 60 * 60 * 1000) {
              localStorage.removeItem(key);
              cleared++;
            }
          }
        } catch (e) {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
          cleared++;
        }
      }
    });
    
    if (cleared > 0) {
      console.log(`Cleared ${cleared} old cache entries`);
    }
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
};

/**
 * Invalidate cache for a specific endpoint (or all if no endpoint provided)
 */
export const invalidateCache = (endpoint = null) => {
  try {
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        if (!endpoint || key.includes(endpoint)) {
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

/**
 * Cache TTL presets
 */
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute - for frequently changing data
  MEDIUM: 5 * 60 * 1000,     // 5 minutes - default
  LONG: 15 * 60 * 1000,      // 15 minutes - for relatively static data
  VERY_LONG: 60 * 60 * 1000, // 1 hour - for static data like categories
};


