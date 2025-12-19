import { api } from './api';
import { sanitizeInput } from '../utils/security';

const ERROR_MESSAGES = {
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

const handleError = (error) => {
  console.log('woocommerce.js handleError called with:', error.message);
  if (error.request && !error.response) {
    const networkError = new Error('Unable to connect to the server. Please check your internet connection.');
    networkError.code = 'NETWORK_ERROR';
    throw networkError;
  }

  if (error.response) {
    const { status, data } = error.response;

    const errorConfig = ERROR_MESSAGES[status];
    if (errorConfig) {
      const err = new Error(errorConfig.message);
      err.code = errorConfig.code;
      err.status = status;
      throw err;
    }

    if (data?.message) {
      // SECURITY: Sanitize error message to prevent sensitive data exposure
      const sanitizedMessage = process.env.NODE_ENV === 'development'
        ? data.message
        : (data.message.includes('API') || data.message.includes('credentials') || data.message.includes('key')
          ? 'An error occurred while processing your request.'
          : data.message);
      const err = new Error(sanitizedMessage);
      err.code = data.code || 'API_ERROR';
      err.status = status;
      throw err;
    }

    if (data?.error) {
      // SECURITY: Sanitize error message
      const errorText = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      const sanitizedMessage = process.env.NODE_ENV === 'development'
        ? errorText
        : (errorText.includes('API') || errorText.includes('credentials') || errorText.includes('key')
          ? 'An error occurred while processing your request.'
          : errorText);
      const err = new Error(sanitizedMessage);
      err.code = data.code || 'API_ERROR';
      err.status = status;
      throw err;
    }

    if (data?.code) {
      const err = new Error(`API Error: ${data.code}`);
      err.code = data.code;
      err.status = status;
      throw err;
    }

    const err = new Error(`API request failed with status ${status}`);
    err.code = 'HTTP_ERROR';
    err.status = status;
    throw err;
  }

  const err = new Error(error.message || 'Network error');
  err.code = 'UNKNOWN_ERROR';
  throw err;
};

const fetchCollection = async (endpoint, params = {}) => {
  const requestParams = { ...params };
  if (requestParams._fields && Array.isArray(requestParams._fields)) {
    requestParams._fields = requestParams._fields.join(',');
  }

  try {
    const response = await api.get(endpoint, { params: requestParams });

    // Handle SETUP_REQUIRED response (new users without WooCommerce settings)
    if (response.data && response.data.code === 'SETUP_REQUIRED') {
      return {
        data: [],
        total: 0,
        totalPages: 0,
      };
    }

    const parseHeaderNumber = (value, fallback = 0) => {
      const parsed = parseInt(value ?? fallback, 10);
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
      data: response.data.products || response.data, // Try products first, fallback to data
      total: calculatedTotal,
      totalPages: totalPages,
    };

    return result;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Sanitize and format product data for WooCommerce API
 */
const prepareProductData = (data) => ({
  ...data,
  name: data.name ? sanitizeInput(data.name) : undefined,
  slug: data.slug ? sanitizeInput(data.slug) : undefined,
  description: data.description ? sanitizeInput(data.description) : undefined,
  short_description: data.short_description ? sanitizeInput(data.short_description) : undefined,
  sku: data.sku ? sanitizeInput(data.sku) : undefined,
});

/**
 * Sanitize and format coupon data for WooCommerce API
 */
const prepareCouponData = (data) => ({
  ...data,
  code: sanitizeInput(data.code || ''),
  description: data.description ? sanitizeInput(data.description) : undefined,
  email_restrictions: data.email_restrictions && Array.isArray(data.email_restrictions)
    ? data.email_restrictions
      .filter(email => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      .map(email => email.trim().toLowerCase())
    : undefined,
  product_ids: data.product_ids && Array.isArray(data.product_ids)
    ? data.product_ids.filter(id => Number.isInteger(id) && id > 0)
    : undefined,
  exclude_product_ids: data.exclude_product_ids && Array.isArray(data.exclude_product_ids)
    ? data.exclude_product_ids.filter(id => Number.isInteger(id) && id > 0)
    : undefined,
  product_categories: data.product_categories && Array.isArray(data.product_categories)
    ? data.product_categories.filter(id => Number.isInteger(id) && id > 0)
    : undefined,
  exclude_product_categories: data.exclude_product_categories && Array.isArray(data.exclude_product_categories)
    ? data.exclude_product_categories.filter(id => Number.isInteger(id) && id > 0)
    : undefined,
});

// Test API connection
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

// Products API
export const productsAPI = {
  // Fetch products with pagination metadata
  list: async (params = {}) => {
    return await fetchCollection('/products', {
      per_page: 24,
      page: 1,
      ...params,
    });
  },

  // Get total product count
  getTotalCount: async () => {
    const { total } = await fetchCollection('/products', { per_page: 1, page: 1 });
    return total;
  },

  // Get low stock products
  getLowStockProducts: async (lowStockThreshold = 2) => {
    const { data } = await fetchCollection('/products', {
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

  // Get single product by ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  create: async (productData) => {
    const response = await api.post('/products', prepareProductData(productData));
    return response.data;
  },

  // Update existing product
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, prepareProductData(productData));
    return response.data;
  },

  // Delete product permanently
  delete: async (id) => {
    // Backend handles force: true, no need to send it from frontend
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Batch operations (create, update, delete multiple products)
  batch: async (data) => {
    const response = await api.post('/products/batch', data);
    return response.data;
  },

  // Bulk delete products
  bulkDelete: async (ids) => {
    if (!ids || ids.length === 0) {
      throw new Error('No product IDs provided');
    }
    // Use batch API to delete multiple products
    const response = await api.post('/products/batch', {
      delete: ids
    });
    return response.data;
  },

  // Sync variable product price
  sync: async (id) => {
    const response = await api.post(`/products/${id}/sync`);
    return response.data;
  },
};

// Aliases for compatibility
productsAPI.get = productsAPI.getById;
productsAPI.getAll = productsAPI.list;

// Orders API
export const ordersAPI = {
  getAll: async (params = {}) => {
    // The backend should handle the WP vs WC API distinction
    // We just call /orders
    const safeParams = {
      per_page: Math.min(params.per_page || 50, 100),
      orderby: params.orderby || 'date',
      order: params.order || 'desc',
      page: params.page || 1,
      _fields: params._fields,
      ...params,
    };

    const { data } = await fetchCollection('/orders', safeParams);
    return data;
  },

  list: async (params = {}) => {
    return await fetchCollection('/orders', {
      per_page: 20,
      orderby: 'date',
      order: 'desc',
      page: 1,
      ...params,
    });
  },

  getTotalCount: async () => {
    const { total } = await fetchCollection('/orders', { per_page: 1, page: 1 });
    return total;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  update: async (id, orderData) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/reports/sales', {
      params: { period: 'month' },
    });
    return response.data;
  },
};

// Customers API
export const customersAPI = {
  list: async (params = {}) => {
    return await fetchCollection('/customers', {
      per_page: 50,
      page: 1,
      ...params,
    });
  },

  getTotalCount: async () => {
    const { total } = await fetchCollection('/customers', { per_page: 1, page: 1 });
    return total;
  },

  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  update: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },
};

// Compatibility alias
customersAPI.getAll = customersAPI.list;

// Reports API
export const reportsAPI = {
  getSales: async (period = 'month') => {
    const response = await api.get('/reports/sales', { params: { period } });
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  list: async (params = {}) => {
    return await fetchCollection('/products/categories', {
      per_page: 50,
      page: 1,
      ...params,
    });
  },

  getById: async (id) => {
    const response = await api.get(`/products/categories/${id}`);
    return response.data;
  },

  create: async (categoryData) => {
    const response = await api.post('/products/categories', {
      ...categoryData,
      name: sanitizeInput(categoryData.name),
      slug: sanitizeInput(categoryData.slug),
      description: sanitizeInput(categoryData.description),
    });
    return response.data;
  },

  update: async (id, categoryData) => {
    const response = await api.put(`/products/categories/${id}`, {
      ...categoryData,
      name: categoryData.name ? sanitizeInput(categoryData.name) : undefined,
      slug: categoryData.slug ? sanitizeInput(categoryData.slug) : undefined,
      description: categoryData.description ? sanitizeInput(categoryData.description) : undefined,
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/categories/${id}`, { params: { force: true } });
    return response.data;
  },

  bulkAssignProducts: async (categoryId, productIds) => {
    // 1. Fetch products in chunks to avoid URL length limits
    const chunkArray = (arr, size) => {
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
    const products = chunkResults.flat();

    // 2. Prepare updates
    const updateData = products.map(product => {
      const currentCategoryIds = (product.categories || []).map(cat => cat.id);
      if (currentCategoryIds.includes(categoryId)) return null;
      return {
        id: product.id,
        categories: [...currentCategoryIds, categoryId].map(id => ({ id }))
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
};

// Aliases for compatibility
categoriesAPI.get = categoriesAPI.getById;
categoriesAPI.getAll = categoriesAPI.list;

// Attributes API
export const attributesAPI = {
  getAll: async (params = {}) => {
    const { data } = await fetchCollection('/products/attributes', {
      per_page: 100,
      ...params,
    });
    return data;
  },

  getTerms: async (attributeId, params = {}) => {
    const response = await fetchCollection(`/products/attributes/${attributeId}/terms`, {
      per_page: 100,
      ...params,
    });
    return response.data;
  },
};

// Media API
export const mediaAPI = {
  upload: async (formData) => {
    // Backend should handle media upload to WP
    const response = await api.post('/media', formData, {
      timeout: 180000, // 180s timeout (3 mins) to handle slow WP servers
    });
    return response.data;
  },
};

// Variations API
export const variationsAPI = {
  /**
   * Get all variations for a product
   * @param {number} productId - Product ID
   * @param {object} params - Query parameters
   * @returns {Promise<{data: Array, total: number}>}
   */
  list: async (productId, params = {}) => {
    return await fetchCollection(`/products/${productId}/variations`, {
      per_page: 100,
      ...params,
    });
  },

  /**
   * Get single variation by ID
   * @param {number} productId - Product ID
   * @param {number} variationId - Variation ID
   * @returns {Promise<object>}
   */
  getById: async (productId, variationId) => {
    const response = await api.get(`/products/${productId}/variations/${variationId}`);
    return response.data;
  },

  /**
   * Create new variation
   * @param {number} productId - Product ID
   * @param {object} variationData - Variation data
   * @returns {Promise<object>}
   */
  create: async (productId, variationData) => {
    const response = await api.post(`/products/${productId}/variations`, variationData);
    return response.data;
  },

  /**
   * Update existing variation
   * @param {number} productId - Product ID
   * @param {number} variationId - Variation ID
   * @param {object} variationData - Updated variation data
   * @returns {Promise<object>}
   */
  update: async (productId, variationId, variationData) => {
    const response = await api.put(`/products/${productId}/variations/${variationId}`, variationData);
    return response.data;
  },

  /**
   * Delete variation
   * @param {number} productId - Product ID
   * @param {number} variationId - Variation ID
   * @returns {Promise<object>}
   */
  delete: async (productId, variationId) => {
    const response = await api.delete(`/products/${productId}/variations/${variationId}`);
    return response.data;
  },

  /**
   * Batch operations (create, update, delete multiple variations)
   * @param {number} productId - Product ID
   * @param {object} data - Batch data { create: [], update: [], delete: [] }
   * @returns {Promise<object>}
   */
  batch: async (productId, data) => {
    const response = await api.post(`/products/${productId}/variations/batch`, data);
    return response.data;
  },
};

// Coupons API
export const couponsAPI = {
  list: async (params = {}) => {
    return await fetchCollection('/coupons', {
      per_page: 50,
      page: 1,
      ...params,
    });
  },

  getById: async (id) => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },

  // Create new coupon
  create: async (couponData) => {
    const response = await api.post('/coupons', prepareCouponData(couponData));
    return response.data;
  },

  // Update existing coupon
  update: async (id, couponData) => {
    const response = await api.put(`/coupons/${id}`, prepareCouponData(couponData));
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/coupons/${id}`, { params: { force: true } });
    return response.data;
  },
};

// Aliases for compatibility
couponsAPI.get = couponsAPI.getById;
couponsAPI.getAll = couponsAPI.list;
