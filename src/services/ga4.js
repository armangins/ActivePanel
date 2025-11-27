import axios from 'axios';

/**
 * Google Analytics 4 (GA4) API Service
 * 
 * This service connects to Google Analytics 4 Data API to fetch:
 * - Traffic data (sessions, users, page views)
 * - E-commerce events (purchases, add_to_cart, view_item)
 * - Conversion data
 * 
 * Note: GA4 API requires OAuth 2.0 authentication or Service Account.
 * For client-side apps, you'll need to use OAuth 2.0 flow or a backend proxy.
 */

// Get GA4 Configuration from localStorage or environment
const getGA4Config = () => {
  const propertyId = import.meta.env.VITE_GA4_PROPERTY_ID || localStorage.getItem('ga4_property_id') || '';
  const accessToken = localStorage.getItem('ga4_access_token') || '';
  
  return { propertyId, accessToken };
};

// Create GA4 API instance
const createGA4Instance = () => {
  const { accessToken } = getGA4Config();
  
  if (!accessToken) {
    throw new Error('GA4 access token not configured. Please authenticate in Settings.');
  }
  
  return axios.create({
    baseURL: 'https://analyticsdata.googleapis.com/v1beta',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};

// Helper function to handle GA4 API errors
const handleGA4Error = (error) => {
  console.error('GA4 API Error:', error);
  
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 401) {
      throw new Error('GA4 authentication failed. Please re-authenticate in Settings.');
    } else if (status === 403) {
      throw new Error('Access forbidden. Please check GA4 API permissions.');
    } else if (status === 404) {
      throw new Error('GA4 property not found. Please check your Property ID.');
    } else if (data?.error?.message) {
      throw new Error(`GA4 API Error: ${data.error.message}`);
    }
    
    throw new Error(`GA4 API request failed with status ${status}`);
  } else if (error.request) {
    throw new Error('Unable to connect to Google Analytics. Please check your internet connection.');
  }
  
  throw new Error(error.message || 'GA4 API error');
};

/**
 * Run a report query to GA4 Data API
 * @param {Object} requestBody - GA4 API request body
 * @returns {Promise<Object>} Report data
 */
const runReport = async (requestBody) => {
  try {
    const { propertyId } = getGA4Config();
    
    if (!propertyId) {
      throw new Error('GA4 Property ID not configured. Please set it in Settings.');
    }
    
    const api = createGA4Instance();
    const response = await api.post(`/properties/${propertyId}:runReport`, requestBody);
    return response.data;
  } catch (error) {
    handleGA4Error(error);
  }
};

/**
 * Get traffic data (sessions, users, page views)
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Traffic metrics
 */
export const getTrafficData = async (startDate, endDate) => {
  const requestBody = {
    dateRanges: [
      {
        startDate: startDate || '30daysAgo',
        endDate: endDate || 'today',
      },
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
    ],
  };
  
  return await runReport(requestBody);
};

/**
 * Get e-commerce events (purchases)
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Purchase events data
 */
export const getPurchaseEvents = async (startDate, endDate) => {
  const requestBody = {
    dateRanges: [
      {
        startDate: startDate || '30daysAgo',
        endDate: endDate || 'today',
      },
    ],
    metrics: [
      { name: 'eventCount' },
      { name: 'totalUsers' },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: {
          matchType: 'EXACT',
          value: 'purchase',
        },
      },
    },
  };
  
  return await runReport(requestBody);
};

/**
 * Get add to cart events
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Add to cart events data
 */
export const getAddToCartEvents = async (startDate, endDate) => {
  const requestBody = {
    dateRanges: [
      {
        startDate: startDate || '30daysAgo',
        endDate: endDate || 'today',
      },
    ],
    metrics: [
      { name: 'eventCount' },
      { name: 'totalUsers' },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: {
          matchType: 'EXACT',
          value: 'add_to_cart',
        },
      },
    },
  };
  
  return await runReport(requestBody);
};

/**
 * Get view item events
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} View item events data
 */
export const getViewItemEvents = async (startDate, endDate) => {
  const requestBody = {
    dateRanges: [
      {
        startDate: startDate || '30daysAgo',
        endDate: endDate || 'today',
      },
    ],
    metrics: [
      { name: 'eventCount' },
      { name: 'totalUsers' },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: {
          matchType: 'EXACT',
          value: 'view_item',
        },
      },
    },
  };
  
  return await runReport(requestBody);
};

/**
 * Get e-commerce revenue data
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Revenue data
 */
export const getRevenueData = async (startDate, endDate) => {
  const requestBody = {
    dateRanges: [
      {
        startDate: startDate || '30daysAgo',
        endDate: endDate || 'today',
      },
    ],
    metrics: [
      { name: 'totalRevenue' },
      { name: 'purchaseRevenue' },
      { name: 'eventCount' },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: {
          matchType: 'EXACT',
          value: 'purchase',
        },
      },
    },
  };
  
  return await runReport(requestBody);
};

/**
 * Test GA4 connection
 * @returns {Promise<Object>} Test result
 */
export const testGA4Connection = async () => {
  try {
    const { propertyId } = getGA4Config();
    
    if (!propertyId) {
      throw new Error('GA4 Property ID not configured.');
    }
    
    // Try to fetch basic traffic data
    const data = await getTrafficData('7daysAgo', 'today');
    return { success: true, data };
  } catch (error) {
    handleGA4Error(error);
  }
};

export default {
  getTrafficData,
  getPurchaseEvents,
  getAddToCartEvents,
  getViewItemEvents,
  getRevenueData,
  testGA4Connection,
};


