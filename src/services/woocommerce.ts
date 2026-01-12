/**
 * WooCommerce API Service
 * 
 * Provides a structured interface to interact with the backend WooCommerce API proxy.
 * Handles product, order, customer, category, and other WooCommerce resource management.
 */

import { api } from './api';
import { sanitizeInput } from '../utils/security';

// Interfaces for Response Types
export interface WooCommerceResponse<T> {
    data: T;
    total: number;
    totalPages: number;
}

interface ErrorConfig {
    code: string;
    message: string;
}

const ERROR_MESSAGES: Record<number, ErrorConfig> = {
    401: {
        code: 'AUTH_FAILED',
        message: 'Authentication failed. Please check your API credentials in Settings.',
    },
    403: {
        code: 'ACCESS_FORBIDDEN',
        message: 'Access forbidden. Please check your API key permissions.',
    },
    404: {
        code: 'NOT_FOUND',
        message: 'Resource not found.',
    },
    500: {
        code: 'SERVER_ERROR',
        message: 'Server error. Please check your WooCommerce store.',
    },
    502: {
        code: 'BAD_GATEWAY',
        message: 'Bad gateway. The server is temporarily unavailable.',
    },
    503: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service unavailable. Please try again later.',
    },
};

/**
 * Handle API error and throw standardized error object.
 * @param error - The error object to handle.
 * @throws Standardized API error.
 */
const handleError = (error: any): never => {
    if (error.request && !error.response) {
        const networkError: any = new Error('Unable to connect to the server. Please check your internet connection.');
        networkError.code = 'NETWORK_ERROR';
        throw networkError;
    }

    if (error.response) {
        const { status, data } = error.response;

        const errorConfig = ERROR_MESSAGES[status];
        if (errorConfig) {
            const err: any = new Error(errorConfig.message);
            err.code = errorConfig.code;
            err.status = status;
            throw err;
        }

        if (data?.message) {
            // SECURITY: Sanitize error message to prevent sensitive data exposure
            const sanitizedMessage = import.meta.env.DEV
                ? data.message
                : (data.message.includes('API') || data.message.includes('credentials') || data.message.includes('key')
                    ? 'An error occurred while processing your request.'
                    : data.message);
            const err: any = new Error(sanitizedMessage);
            err.code = data.code || 'API_ERROR';
            err.status = status;
            throw err;
        }

        if (data?.error) {
            // SECURITY: Sanitize error message
            const errorText = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
            const sanitizedMessage = import.meta.env.DEV
                ? errorText
                : (errorText.includes('API') || errorText.includes('credentials') || errorText.includes('key')
                    ? 'An error occurred while processing your request.'
                    : errorText);
            const err: any = new Error(sanitizedMessage);
            err.code = data.code || 'API_ERROR';
            err.status = status;
            throw err;
        }

        if (data?.code) {
            const err: any = new Error(`API Error: ${data.code}`);
            err.code = data.code;
            err.status = status;
            throw err;
        }

        const err: any = new Error(`API request failed with status ${status}`);
        err.code = 'HTTP_ERROR';
        err.status = status;
        throw err;
    }

    const err: any = new Error(error.message || 'Network error');
    err.code = 'UNKNOWN_ERROR';
    throw err;
};

/**
 * Fetch a collection of resources with pagination.
 * @param endpoint - API endpoint to fetch from.
 * @param params - Query parameters.
 * @returns Promise with data, total count, and total pages.
 */
const fetchCollection = async <T>(endpoint: string, params: any = {}): Promise<WooCommerceResponse<T>> => {
    const requestParams = { ...params };
    if (requestParams._fields && Array.isArray(requestParams._fields)) {
        requestParams._fields = requestParams._fields.join(',');
    }

    try {
        const response = await api.get(endpoint, { params: requestParams });

        // Handle SETUP_REQUIRED response (new users without WooCommerce settings)
        if (response.data && response.data.code === 'SETUP_REQUIRED') {
            return {
                data: [] as any as T,
                total: 0,
                totalPages: 0,
            };
        }

        const parseHeaderNumber = (value: string | undefined, fallback = 0): number => {
            const parsed = parseInt(value ?? String(fallback), 10);
            return Number.isNaN(parsed) ? fallback : parsed;
        };

        // Backend returns { products: [...], total: X, totalPages: Y }
        const totalPages = response.data.totalPages || parseHeaderNumber(response.headers['x-wp-totalpages'], 1);
        const total = response.data.total || parseHeaderNumber(response.headers['x-wp-total']);

        // If backend sends total: 0 but has totalPages, calculate approximate total
        const calculatedTotal = total === 0 && totalPages > 0
            ? (totalPages - 1) * (params.per_page || 25) + (response.data.products?.length || 0)
            : total;

        const result = {
            data: (response.data.products || response.data) as T, // Try products first, fallback to data
            total: calculatedTotal,
            totalPages: totalPages,
        };

        return result;
    } catch (error) {
        handleError(error);
        // Unreachable due to handleError throwing, but needed for TS
        return { data: [] as any as T, total: 0, totalPages: 0 };
    }
};

/**
 * Sanitize and format product data for WooCommerce API.
 * @param data - Raw product data.
 * @returns Sanitized product data.
 */
const prepareProductData = (data: any): any => ({
    ...data,
    name: data.name ? sanitizeInput(data.name) : undefined,
    slug: data.slug ? sanitizeInput(data.slug) : undefined,
    description: data.description ? sanitizeInput(data.description) : undefined,
    short_description: data.short_description ? sanitizeInput(data.short_description) : undefined,
    sku: data.sku ? sanitizeInput(data.sku) : undefined,
});

/**
 * Sanitize and format coupon data for WooCommerce API.
 * @param data - Raw coupon data.
 * @returns Sanitized coupon data.
 */
const prepareCouponData = (data: any): any => ({
    ...data,
    code: sanitizeInput(data.code || ''),
    description: data.description ? sanitizeInput(data.description) : undefined,
    email_restrictions: data.email_restrictions && Array.isArray(data.email_restrictions)
        ? data.email_restrictions
            .filter((email: any) => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
            .map((email: string) => email.trim().toLowerCase())
        : undefined,
    product_ids: data.product_ids && Array.isArray(data.product_ids)
        ? data.product_ids.filter((id: any) => Number.isInteger(id) && id > 0)
        : undefined,
    exclude_product_ids: data.exclude_product_ids && Array.isArray(data.exclude_product_ids)
        ? data.exclude_product_ids.filter((id: any) => Number.isInteger(id) && id > 0)
        : undefined,
    product_categories: data.product_categories && Array.isArray(data.product_categories)
        ? data.product_categories.filter((id: any) => Number.isInteger(id) && id > 0)
        : undefined,
    exclude_product_categories: data.exclude_product_categories && Array.isArray(data.exclude_product_categories)
        ? data.exclude_product_categories.filter((id: any) => Number.isInteger(id) && id > 0)
        : undefined,
});

/**
 * Test API connection.
 * @returns Promise with success status and sample data.
 */
export const testConnection = async () => {
    try {
        // Test with a simple products request (limit to 1 for speed)
        // This now calls the backend /api/products
        const response = await api.get('/products', { params: { per_page: 1 } });
        return { success: true, data: response.data };
    } catch (error) {
        handleError(error);
    }
};

/**
 * Products API Service
 */
export const productsAPI = {
    /**
     * Fetch products with pagination metadata.
     * @param params - Query parameters (page, per_page, search, etc.)
     */
    list: async (params = {}): Promise<WooCommerceResponse<any[]>> => {
        return await fetchCollection<any[]>('/products', {
            per_page: 24,
            page: 1,
            ...params,
        });
    },

    /**
     * Get total product count.
     */
    getTotalCount: async (): Promise<number> => {
        const { total } = await fetchCollection('/products', { per_page: 1, page: 1 });
        return total;
    },

    /**
     * Get low stock products based on threshold.
     * @param lowStockThreshold - Threshold for low stock (default: 2)
     */
    getLowStockProducts: async (lowStockThreshold = 2): Promise<any[]> => {
        const { data } = await fetchCollection<any[]>('/products', {
            per_page: 100,
            status: 'publish',
        });

        return data.filter(product => {
            if (product.stock_status === 'outofstock') return true;
            if (product.manage_stock && product.stock_quantity !== null) {
                return parseFloat(product.stock_quantity) <= lowStockThreshold;
            }
            return false;
        });
    },

    /**
     * Get single product by ID.
     * @param id - Product ID
     */
    getById: async (id: number | string): Promise<any> => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    /**
     * Create new product.
     * @param productData - Product data
     */
    create: async (productData: any): Promise<any> => {
        const response = await api.post('/products', prepareProductData(productData));
        return response.data;
    },

    /**
     * Update existing product.
     * @param id - Product ID
     * @param productData - Updated product data
     */
    update: async (id: number | string, productData: any): Promise<any> => {
        const response = await api.put(`/products/${id}`, prepareProductData(productData));
        return response.data;
    },

    /**
     * Delete product permanently.
     * @param id - Product ID
     */
    delete: async (id: number | string): Promise<any> => {
        // Backend handles force: true, no need to send it from frontend
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    /**
     * Batch operations (create, update, delete multiple products).
     * @param data - Batch payload
     */
    batch: async (data: any): Promise<any> => {
        const response = await api.post('/products/batch', data);
        return response.data;
    },

    /**
     * Bulk delete products.
     * @param ids - Array of product IDs
     */
    bulkDelete: async (ids: number[]): Promise<any> => {
        if (!ids || ids.length === 0) {
            throw new Error('No product IDs provided');
        }
        // Use batch API to delete multiple products
        const response = await api.post('/products/batch', {
            delete: ids
        });
        return response.data;
    },

    /**
     * Sync variable product price.
     * @param id - Product ID
     */
    sync: async (id: number | string): Promise<any> => {
        const response = await api.post(`/products/${id}/sync`);
        return response.data;
    },

    // Aliases for compatibility
    get: async (id: number | string) => await api.get(`/products/${id}`).then(res => res.data),
    getAll: async (params = {}) => await fetchCollection<any[]>('/products', { per_page: 24, page: 1, ...params }),
};

/**
 * Orders API Service
 */
export const ordersAPI = {
    /**
     * Get all orders with flexible parameters (alias for list)
     */
    getAll: async (params: any = {}) => {
        const safeParams = {
            per_page: Math.min(params.per_page || 50, 100),
            orderby: params.orderby || 'date',
            order: params.order || 'desc',
            page: params.page || 1,
            _fields: params._fields,
            ...params,
        };

        const { data } = await fetchCollection<any[]>('/orders', safeParams);
        return data;
    },

    /**
     * List orders with pagination.
     */
    list: async (params = {}): Promise<WooCommerceResponse<any[]>> => {
        return await fetchCollection<any[]>('/orders', {
            per_page: 20,
            orderby: 'date',
            order: 'desc',
            page: 1,
            ...params,
        });
    },

    /**
     * Get total order count.
     */
    getTotalCount: async (): Promise<number> => {
        const { total } = await fetchCollection('/orders', { per_page: 1, page: 1 });
        return total;
    },

    /**
     * Get order by ID.
     */
    getById: async (id: number | string): Promise<any> => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    /**
     * Update order status or data.
     */
    update: async (id: number | string, orderData: any): Promise<any> => {
        const response = await api.put(`/orders/${id}`, orderData);
        return response.data;
    },

    /**
     * Get sales statistics.
     */
    getStats: async (): Promise<any> => {
        const response = await api.get('/reports/sales', {
            params: { period: 'month' },
        });
        return response.data;
    },
};

/**
 * Customers API Service
 */
export const customersAPI = {
    /**
     * List customers with pagination.
     */
    list: async (params = {}): Promise<WooCommerceResponse<any[]>> => {
        return await fetchCollection<any[]>('/customers', {
            per_page: 50,
            page: 1,
            ...params,
        });
    },

    /**
     * Get total customer count.
     */
    getTotalCount: async (): Promise<number> => {
        const { total } = await fetchCollection('/customers', { per_page: 1, page: 1 });
        return total;
    },

    /**
     * Get customer by ID.
     */
    getById: async (id: number | string): Promise<any> => {
        const response = await api.get(`/customers/${id}`);
        return response.data;
    },

    /**
     * Create new customer.
     */
    create: async (customerData: any): Promise<any> => {
        const response = await api.post('/customers', customerData);
        return response.data;
    },

    /**
     * Update customer data.
     */
    update: async (id: number | string, customerData: any): Promise<any> => {
        const response = await api.put(`/customers/${id}`, customerData);
        return response.data;
    },

    // Aliases for compatibility
    getAll: async (params = {}) => await fetchCollection<any[]>('/customers', { per_page: 50, page: 1, ...params }),
};

/**
 * Reports API Service
 */
export const reportsAPI = {
    /**
     * Get sales reports.
     * @param period - 'week', 'month', 'last_month', 'year'
     */
    getSales: async (period = 'month'): Promise<any> => {
        const response = await api.get('/reports/sales', { params: { period } });
        return response.data;
    },
};

/**
 * Categories API Service
 */
export const categoriesAPI = {
    /**
     * List categories with pagination.
     */
    list: async (params = {}): Promise<WooCommerceResponse<any[]>> => {
        return await fetchCollection<any[]>('/products/categories', {
            per_page: 50,
            page: 1,
            ...params,
        });
    },

    /**
     * Get category by ID.
     */
    getById: async (id: number | string): Promise<any> => {
        const response = await api.get(`/products/categories/${id}`);
        return response.data;
    },

    /**
     * Create new category.
     */
    create: async (categoryData: any): Promise<any> => {
        const response = await api.post('/products/categories', {
            ...categoryData,
            name: sanitizeInput(categoryData.name),
            slug: sanitizeInput(categoryData.slug),
            description: sanitizeInput(categoryData.description),
        });
        return response.data;
    },

    /**
     * Update existing category.
     */
    update: async (id: number | string, categoryData: any): Promise<any> => {
        const response = await api.put(`/products/categories/${id}`, {
            ...categoryData,
            name: categoryData.name ? sanitizeInput(categoryData.name) : undefined,
            slug: categoryData.slug ? sanitizeInput(categoryData.slug) : undefined,
            description: categoryData.description ? sanitizeInput(categoryData.description) : undefined,
        });
        return response.data;
    },

    /**
     * Delete category.
     */
    delete: async (id: number | string): Promise<any> => {
        const response = await api.delete(`/products/categories/${id}`); // backend automatically adds force=true if implemented
        return response.data;
    },

    /**
     * Bulk assign products to a category.
     */
    bulkAssignProducts: async (categoryId: number, productIds: number[]): Promise<any> => {
        // 1. Fetch products in chunks to avoid URL length limits
        const chunkArray = (arr: any[], size: number) => {
            return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
                arr.slice(i * size, i * size + size)
            );
        };

        const idChunks = chunkArray(productIds, 40); // 40 IDs per request is safe for URL length

        // OPTIMIZATION: Run fetches in parallel and request ONLY needed fields
        const chunksPromises = idChunks.map(chunk =>
            productsAPI.getAll({
                include: chunk.join(','),
                per_page: 50,
                _fields: 'id,categories' // Critical: Fetch only what we need!
            })
        );

        const chunkResults = await Promise.all(chunksPromises);
        const products: any[] = chunkResults.map(p => p.data).flat();

        // 2. Prepare updates
        const updateData = products.map((product: any) => {
            const currentCategoryIds = (product.categories || []).map((cat: any) => cat.id);
            if (currentCategoryIds.includes(categoryId)) return null;
            return {
                id: product.id,
                categories: [...currentCategoryIds, categoryId].map((id: number) => ({ id }))
            };
        }).filter(Boolean);

        if (updateData.length === 0) return { success: true };

        // 3. Batch update
        const chunkSize = 100;
        const updates = [];
        for (let i = 0; i < updateData.length; i += chunkSize) {
            const chunk = updateData.slice(i, i + chunkSize);
            updates.push(productsAPI.batch({ update: chunk }));
        }
        await Promise.all(updates);

        return { success: true };
    },

    // Aliases for compatibility
    get: async (id: number | string) => await api.get(`/products/categories/${id}`).then(res => res.data),
    getAll: async (params = {}) => await fetchCollection<any[]>('/products/categories', { per_page: 50, page: 1, ...params }),
};

/**
 * Attributes API Service
 */
export const attributesAPI = {
    /**
     * Get all attributes (alias for list)
     */
    getAll: async (params = {}): Promise<any[]> => {
        const { data } = await fetchCollection<any[]>('/products/attributes', {
            per_page: 100,
            ...params,
        });
        return data;
    },

    /**
     * Get attribute by ID.
     */
    getById: async (id: number | string): Promise<any> => {
        const response = await api.get(`/products/attributes/${id}`);
        return response.data;
    },

    /**
     * Create attribute.
     */
    create: async (data: any): Promise<any> => {
        const response = await api.post('/products/attributes', {
            name: sanitizeInput(data.name),
            slug: sanitizeInput(data.slug),
            type: data.type || 'select',
            order_by: data.order_by || 'menu_order',
            has_archives: data.has_archives || true,
        });
        return response.data;
    },

    /**
     * Update attribute.
     */
    update: async (id: number | string, data: any): Promise<any> => {
        // Missing logic in original file, added restoration but checking api docs
        // Assuming put request like others
        const response = await api.put(`/products/attributes/${id}`, data);
        return response.data;
    },

    /**
     * Delete attribute.
     */
    delete: async (id: number | string): Promise<any> => {
        const response = await api.delete(`/products/attributes/${id}`);
        return response.data;
    },

    /**
     * Get terms for an attribute.
     */
    getTerms: async (attributeId: number | string, params = {}): Promise<any[]> => {
        const { data } = await fetchCollection<any[]>(`/products/attributes/${attributeId}/terms`, {
            per_page: 100,
            ...params,
        });
        return data;
    },

    /**
     * Create attribute term.
     */
    createTerm: async (attributeId: number | string, data: any): Promise<any> => {
        const response = await api.post(`/products/attributes/${attributeId}/terms`, data);
        return response.data;
    },

    /**
     * Update attribute term.
     */
    updateTerm: async (attributeId: number | string, termId: number | string, data: any): Promise<any> => {
        const response = await api.put(`/products/attributes/${attributeId}/terms/${termId}`, data);
        return response.data;
    },

    /**
     * Delete attribute term.
     */
    deleteTerm: async (attributeId: number | string, termId: number | string): Promise<any> => {
        const response = await api.delete(`/products/attributes/${attributeId}/terms/${termId}`);
        return response.data;
    },
};

/**
 * Media API Service
 */
export const mediaAPI = {
    /**
     * Upload media file.
     * @param formData - FormData with 'file' field.
     */
    upload: async (formData: FormData): Promise<any> => {
        // Backend should handle media upload to WP
        const response = await api.post('/media', formData, {
            timeout: 180000, // 180s timeout (3 mins) to handle slow WP servers
        });
        return response.data;
    },
};

/**
 * Variations API Service
 */
export const variationsAPI = {
    /**
     * Get all variations for a product
     * @param productId - Product ID
     * @param params - Query parameters
     * @returns Promise with data array and total count
     */
    list: async (productId: number | string, params = {}): Promise<WooCommerceResponse<any[]>> => {
        return await fetchCollection<any[]>(`/products/${productId}/variations`, {
            per_page: 100,
            ...params,
        });
    },

    /**
     * Get single variation by ID
     * @param productId - Product ID
     * @param variationId - Variation ID
     * @returns Promise with variation object
     */
    getById: async (productId: number | string, variationId: number | string): Promise<any> => {
        const response = await api.get(`/products/${productId}/variations/${variationId}`);
        return response.data;
    },

    /**
     * Create new variation
     * @param productId - Product ID
     * @param variationData - Variation data
     * @returns Promise with created variation
     */
    create: async (productId: number | string, variationData: any): Promise<any> => {
        const response = await api.post(`/products/${productId}/variations`, variationData);
        return response.data;
    },

    /**
     * Update existing variation
     * @param productId - Product ID
     * @param variationId - Variation ID
     * @param variationData - Updated variation data
     * @returns Promise with updated variation
     */
    update: async (productId: number | string, variationId: number | string, variationData: any): Promise<any> => {
        const response = await api.put(`/products/${productId}/variations/${variationId}`, variationData);
        return response.data;
    },

    /**
     * Delete variation
     * @param productId - Product ID
     * @param variationId - Variation ID
     * @returns Promise with deleted variation info
     */
    delete: async (productId: number | string, variationId: number | string): Promise<any> => {
        const response = await api.delete(`/products/${productId}/variations/${variationId}`);
        return response.data;
    },

    /**
     * Batch operations (create, update, delete multiple variations)
     * @param productId - Product ID
     * @param data - Batch data { create: [], update: [], delete: [] }
     * @returns Promise with batch operation results
     */
    batch: async (productId: number | string, data: any): Promise<any> => {
        const response = await api.post(`/products/${productId}/variations/batch`, data);
        return response.data;
    },
};

/**
 * Coupons API Service
 */
export const couponsAPI = {
    /**
     * List coupons with pagination.
     */
    list: async (params = {}): Promise<WooCommerceResponse<any[]>> => {
        return await fetchCollection<any[]>('/coupons', {
            per_page: 50,
            page: 1,
            ...params,
        });
    },

    /**
     * Get coupon by ID.
     */
    getById: async (id: number | string): Promise<any> => {
        const response = await api.get(`/coupons/${id}`);
        return response.data;
    },

    /**
     * Create new coupon.
     */
    create: async (couponData: any): Promise<any> => {
        const response = await api.post('/coupons', prepareCouponData(couponData));
        return response.data;
    },

    /**
     * Update existing coupon.
     */
    update: async (id: number | string, couponData: any): Promise<any> => {
        const response = await api.put(`/coupons/${id}`, prepareCouponData(couponData));
        return response.data;
    },

    /**
     * Delete coupon.
     */
    delete: async (id: number | string): Promise<any> => {
        const response = await api.delete(`/coupons/${id}`); // backend automatically handles force param if needed
        return response.data;
    },

    // Aliases for compatibility
    get: async (id: number | string) => await api.get(`/coupons/${id}`).then(res => res.data),
    getAll: async (params = {}) => await fetchCollection<any[]>('/coupons', { per_page: 50, page: 1, ...params }),
};
