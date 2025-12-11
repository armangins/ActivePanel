export const PAGINATION_DEFAULTS = {
    COUPONS_PER_PAGE: 10,
    ORDERS_PER_PAGE: 10,
    // PERFORMANCE: Reduced from 24 to 16 for faster initial load
    // More products load on scroll for better perceived performance
    PRODUCTS_PER_PAGE: 16,
    CUSTOMERS_PER_PAGE: 10,
};

export const API_ENDPOINTS = {
    COUPONS: '/wc/v3/coupons',
    ORDERS: '/wc/v3/orders',
    PRODUCTS: '/wc/v3/products',
    CUSTOMERS: '/wc/v3/customers',
};
