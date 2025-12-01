/**
 * Application Constants
 * 
 * Centralized constants used across the application
 */

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,    // 1 minute
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 15 * 60 * 1000,    // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
};

// API pagination defaults
export const PAGINATION = {
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 100,
};

// Stock threshold defaults
export const STOCK = {
  DEFAULT_LOW_STOCK_THRESHOLD: 2,
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm',
};

// Chart colors
export const CHART_COLORS = {
  PRIMARY: '#4560FF',
  SECONDARY: '#EBF3FF',
  HIGHLIGHT: '#7c3aed',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
};

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PRODUCTS_PER_PAGE: 10,
  ORDERS_PER_PAGE: 50,
  CUSTOMERS_PER_PAGE: 24,
  COUPONS_PER_PAGE: 50,
};

