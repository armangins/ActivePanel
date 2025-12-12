import axios from 'axios';
import { secureLog } from '../utils/logger';

// Google Analytics 4 Measurement Protocol API
const GA4_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const GA4_VALIDATION_ENDPOINT = 'https://www.google-analytics.com/debug/mp/collect';

// In-memory configuration
let ga4Config = {
    propertyId: '',
    accessToken: ''
};

export const setGA4Config = (config) => {
    ga4Config = { ...ga4Config, ...config };
};

// Get GA4 Configuration from memory or environment
const getGA4Config = () => {
    const propertyId = ga4Config.propertyId || import.meta.env.VITE_GA4_PROPERTY_ID || '';
    const accessToken = ga4Config.accessToken || '';

    return { propertyId, accessToken };
};

// Helper to make GA4 requests
const fetchGA4Data = async (metric, startDate, endDate) => {
    const { propertyId, accessToken } = getGA4Config();

    if (!propertyId || !accessToken) {
        secureLog.warn('GA4 credentials not configured');
        return null;
    }

    // Note: The Measurement Protocol is primarily for sending events, not fetching reports.
    // For fetching reports, you would typically use the Google Analytics Data API (v1beta).
    // However, since this is a client-side app without a backend proxy for OAuth,
    // we can't securely use the Data API directly with a service account.
    //
    // For this demo/implementation, we'll return mock data if credentials are present,
    // or you would need a backend service to proxy these requests.

    // Mock data generator for demonstration
    return generateMockData(metric);
};

const generateMockData = (metric) => {
    // Generate realistic-looking mock data based on the metric
    const days = 30;
    const data = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split('T')[0];

        let value = 0;
        switch (metric) {
            case 'activeUsers':
                value = Math.floor(Math.random() * 100) + 50;
                break;
            case 'purchases':
                value = Math.floor(Math.random() * 10);
                break;
            case 'addToCarts':
                value = Math.floor(Math.random() * 20) + 5;
                break;
            case 'grossPurchaseRevenue':
                value = Math.floor(Math.random() * 1000) + 100;
                break;
            default:
                value = 0;
        }

        data.push({ date: dateStr, value });
    }

    return data;
};

export const getTrafficData = async (startDate, endDate) => {
    return fetchGA4Data('activeUsers', startDate, endDate);
};

export const getPurchaseEvents = async (startDate, endDate) => {
    return fetchGA4Data('purchases', startDate, endDate);
};

export const getAddToCartEvents = async (startDate, endDate) => {
    return fetchGA4Data('addToCarts', startDate, endDate);
};

export const getRevenueData = async (startDate, endDate) => {
    return fetchGA4Data('grossPurchaseRevenue', startDate, endDate);
};
