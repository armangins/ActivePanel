import axios from 'axios';
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// In-memory configuration
let wooConfig = {
  url: '',
  key: '',
  secret: '',
  lowStockThreshold: 2
};

let wpConfig = {
  username: '',
  appPassword: ''
};

export const setWooCommerceConfig = (config) => {
  wooConfig = { ...wooConfig, ...config };
};

export const setWordPressConfig = (config) => {
  wpConfig = { ...wpConfig, ...config };
};

// WooCommerce API Configuration
// Get credentials from environment variables or memory
const getWooCommerceConfig = () => {
  const url = import.meta.env.VITE_WOOCOMMERCE_URL || wooConfig.url || '';
  const key = import.meta.env.VITE_CONSUMER_KEY || wooConfig.key || '';
  const secret = import.meta.env.VITE_CONSUMER_SECRET || wooConfig.secret || '';

  return { url, key, secret };
};

export const hasWooCommerceConfig = () => {
  const { url, key, secret } = getWooCommerceConfig();
  return !!(url && key && secret);
};

// Get WordPress Application Password for media uploads (optional)
const getWordPressAuth = () => {
  const appPassword = wpConfig.appPassword || '';
  const wpUsername = wpConfig.username || '';

  // If Application Password is set, use it; otherwise fall back to WooCommerce credentials
  if (appPassword && wpUsername) {
    // Keep Application Password as-is (with spaces if provided)
    // WordPress Application Password can be used with or without spaces
    const cleanUsername = wpUsername.trim();
    const cleanPassword = appPassword.trim();

    // ⚠️ SECURITY: Never log sensitive credentials
    // Only log in development mode for debugging
    if (import.meta.env.DEV) {
      // Log only non-sensitive info in development
    }

    return { username: cleanUsername, password: cleanPassword };
  }

  // Fall back to WooCommerce credentials
  const { key, secret } = getWooCommerceConfig();
  // ⚠️ SECURITY: Never log credentials
  return { username: key, password: secret };
};

// Create axios instance with basic auth
const createApiInstance = () => {
  const { url, key, secret } = getWooCommerceConfig();

  if (!url || !key || !secret) {
    throw new Error('WooCommerce API credentials not configured. Please set them in Settings.');
  }

  return axios.create({
    baseURL: `${url}/wp-json/wc/v3`,
    auth: {
      username: key,
      password: secret,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Create WordPress REST API instance (for orders details)
// Uses WordPress Application Password if available, otherwise falls back to WooCommerce credentials
const createWordPressApiInstance = () => {
  const { url } = getWooCommerceConfig();
  const wpAuth = getWordPressAuth();

  if (!url) {
    throw new Error('WordPress URL not configured. Please set it in Settings.');
  }

  return axios.create({
    baseURL: `${url}/wp-json`,
    auth: {
      username: wpAuth.username,
      password: wpAuth.password,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Get API instance (recreated on each call to get latest credentials)
const getApi = () => createApiInstance();

// Helper function to handle API errors
const handleError = (error) => {
  // ⚠️ SECURITY: Never log full error objects that might contain credentials
  // Only log error message in development
  if (import.meta.env.DEV) {
    // Log only error message, not full error object with credentials
  }

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Handle specific error cases
    if (status === 401) {
      throw new Error('Authentication failed. Please check your API credentials in Settings.');
    } else if (status === 403) {
      throw new Error('Access forbidden. Please check your API key permissions.');
    } else if (status === 404) {
      throw new Error('WooCommerce REST API not found. Please ensure WooCommerce is installed and REST API is enabled.');
    } else if (status === 500) {
      throw new Error('Server error. Please check your WooCommerce store.');
    } else if (data?.message) {
      throw new Error(data.message);
    } else if (data?.code) {
      throw new Error(`API Error: ${data.code}`);
    }
    throw new Error(`API request failed with status ${status}`);
  } else if (error.request) {
    throw new Error('Unable to connect to your WooCommerce store. Please check the store URL and your internet connection.');
  } else if (error.message && error.message.includes('credentials')) {
    throw error; // Re-throw credential errors as-is
  }

  throw new Error(error.message || 'Network error or invalid configuration');
};

// Helper for collection endpoints to expose pagination metadata
const fetchCollection = async (endpoint, params = {}) => {
  const api = getApi();

  // Handle _fields parameter
  const requestParams = { ...params };
  if (requestParams._fields && Array.isArray(requestParams._fields)) {
    requestParams._fields = requestParams._fields.join(',');
  }

  const response = await api.get(endpoint, { params: requestParams });

  const parseHeaderNumber = (value, fallback = 0) => {
    const parsed = parseInt(value ?? fallback, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const result = {
    data: response.data,
    total: parseHeaderNumber(response.headers['x-wp-total']),
    totalPages: parseHeaderNumber(response.headers['x-wp-totalpages'], 1),
  };

  return result;
};

// Generic Batch API
export const batchRequest = async (requests) => {
  try {
    const wpApi = createWordPressApiInstance();
    // WordPress batch endpoint usually expects 'requests' array
    const response = await wpApi.post('/batch/v1', {
      requests: requests.map(req => ({
        method: req.method || 'GET',
        path: req.path,
        body: req.body,
        headers: req.headers || {},
      })),
    });

    // Response is an array of responses
    return response.data.responses ? response.data.responses : response.data;
  } catch (error) {
    // If batch endpoint is not found (404), we might want to fallback or just throw
    // For now, we'll let the caller handle the error or fallback
    handleError(error);
  }
};

// Test API connection
export const testConnection = async () => {
  try {
    const api = getApi();
    // Test with a simple products request (limit to 1 for speed)
    const response = await api.get('/products', { params: { per_page: 1 } });
    return { success: true, data: response.data };
  } catch (error) {
    handleError(error);
  }
};

// Products API
export const productsAPI = {
  getAll: async (params = {}) => {
    try {
      const { data } = await fetchCollection('/products', {
        per_page: 50,
        page: 1,
        ...params,
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  list: async (params = {}) => {
    try {
      return await fetchCollection('/products', {
        per_page: 24,
        page: 1,
        ...params,
      });
    } catch (error) {
      handleError(error);
    }
  },

  getTotalCount: async () => {
    try {
      const { total } = await fetchCollection('/products', { per_page: 1, page: 1 });
      return total;
    } catch (error) {
      handleError(error);
    }
  },

  getLowStockProducts: async (lowStockThreshold = null) => {
    try {
      // Get threshold from memory if not provided
      if (lowStockThreshold === null) {
        lowStockThreshold = wooConfig.lowStockThreshold || 2;
      }

      // Get all products (both in stock and out of stock)
      const { data } = await fetchCollection('/products', {
        per_page: 100,
        status: 'publish',
      });

      // Filter products with low stock or out of stock
      const lowStockProducts = data.filter(product => {
        // Out of stock
        if (product.stock_status === 'outofstock') {
          return true;
        }

        // Low stock (manage_stock is true and stock_quantity <= threshold)
        if (product.manage_stock && product.stock_quantity !== null) {
          return parseFloat(product.stock_quantity) <= lowStockThreshold;
        }

        return false;
      });

      return lowStockProducts;
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const api = getApi();
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (productData) => {
    try {
      const api = getApi();
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, productData) => {
    try {
      const api = getApi();
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const api = getApi();
      const response = await api.delete(`/products/${id}`, { force: true });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  batch: async (data) => {
    try {
      const api = getApi();
      const response = await api.post('/products/batch', data);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Orders API
// Uses WordPress REST API for fetching orders (with Application Password if available)
export const ordersAPI = {
  getAll: async (params = {}) => {
    try {
      // Try WordPress REST API first (with Application Password if available)
      try {
        const wpApi = createWordPressApiInstance();
        // Ensure per_page doesn't exceed 100 (WooCommerce API limit)
        const safeParams = {
          per_page: Math.min(params.per_page || 50, 100),
          orderby: params.orderby || 'date',
          order: params.order || 'desc',
          page: params.page || 1,
          _fields: params._fields, // Pass _fields if present
          ...params,
        };
        // Remove per_page if it's invalid
        if (safeParams.per_page > 100) {
          safeParams.per_page = 100;
        }

        const response = await wpApi.get('/wc/v3/orders', {
          params: safeParams,
        });

        // Return data in same format as fetchCollection
        return response.data;
      } catch (wpError) {
        // Fallback to WooCommerce API
        const safeParams = {
          per_page: Math.min(params.per_page || 50, 100),
          orderby: params.orderby || 'date',
          order: params.order || 'desc',
          page: params.page || 1,
          _fields: params._fields, // Pass _fields if present
          ...params,
        };
        if (safeParams.per_page > 100) {
          safeParams.per_page = 100;
        }

        const { data } = await fetchCollection('/orders', safeParams);
        return data;
      }
    } catch (error) {
      handleError(error);
    }
  },

  list: async (params = {}) => {
    try {
      const listParams = {
        per_page: 20,
        orderby: 'date',
        order: 'desc',
        page: 1,
        _fields: params._fields, // Pass _fields if present
        ...params,
      };

      // Try WordPress REST API first (with Application Password if available)
      try {
        const wpApi = createWordPressApiInstance();
        const response = await wpApi.get('/wc/v3/orders', {
          params: listParams,
        });

        // Parse pagination headers
        const total = parseInt(response.headers['x-wp-total'] || '0', 10);
        const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);

        const result = {
          data: response.data,
          total,
          totalPages,
        };

        return result;
      } catch (wpError) {
        // Fallback to WooCommerce API
        return await fetchCollection('/orders', listParams);
      }
    } catch (error) {
      handleError(error);
    }
  },

  getTotalCount: async () => {
    try {
      // Try WordPress REST API first (with Application Password if available)
      try {
        const wpApi = createWordPressApiInstance();
        const response = await wpApi.get('/wc/v3/orders', {
          params: { per_page: 1, page: 1 },
        });
        const total = parseInt(response.headers['x-wp-total'] || '0', 10);
        return total;
      } catch (wpError) {
        // Fallback to WooCommerce API
        const { total } = await fetchCollection('/orders', { per_page: 1, page: 1 });
        return total;
      }
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id) => {
    try {
      // Use WordPress REST API for order details (with Application Password if available)
      try {
        const wpApi = createWordPressApiInstance();
        const response = await wpApi.get(`/wc/v3/orders/${id}`);
        return response.data;
      } catch (wpError) {
        // Fallback to WooCommerce API if WordPress API fails
        const api = getApi();
        const response = await api.get(`/orders/${id}`);
        return response.data;
      }
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, orderData) => {
    try {
      // Use WordPress REST API for order updates (with Application Password if available)
      try {
        const wpApi = createWordPressApiInstance();
        const response = await wpApi.put(`/wc/v3/orders/${id}`, orderData);
        return response.data;
      } catch (wpError) {
        // Fallback to WooCommerce API
        const api = getApi();
        const response = await api.put(`/orders/${id}`, orderData);
        return response.data;
      }
    } catch (error) {
      handleError(error);
    }
  },

  getStats: async () => {
    try {
      const api = getApi();
      const response = await api.get('/reports/sales', {
        params: {
          period: 'month',
        },
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Customers API
export const customersAPI = {
  getAll: async (params = {}) => {
    try {
      const { data } = await fetchCollection('/customers', {
        per_page: 50,
        page: 1,
        _fields: params._fields, // Pass _fields if present
        ...params,
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  list: async (params = {}) => {
    try {
      return await fetchCollection('/customers', {
        per_page: 50,
        page: 1,
        _fields: params._fields, // Pass _fields if present
        ...params,
      });
    } catch (error) {
      handleError(error);
    }
  },

  getTotalCount: async () => {
    try {
      const { total } = await fetchCollection('/customers', { per_page: 1, page: 1 });
      return total;
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const api = getApi();
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (customerData) => {
    try {
      const api = getApi();
      const response = await api.post('/customers', customerData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, customerData) => {
    try {
      const api = getApi();
      const response = await api.put(`/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Reports API
export const reportsAPI = {
  getSales: async (period = 'month') => {
    try {
      const api = getApi();
      const response = await api.get('/reports/sales', { params: { period } });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  getTopSellers: async () => {
    try {
      const api = getApi();
      const response = await api.get('/reports/top_sellers');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (params = {}) => {
    try {
      const queryParams = {
        per_page: 100,
        ...params,
      };

      const api = getApi();
      const response = await api.get('/products/categories', { params: queryParams });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  list: async (params = {}) => {
    try {
      return await fetchCollection('/products/categories', {
        per_page: 50,
        page: 1,
        ...params,
      });
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const api = getApi();
      const response = await api.get(`/products/categories/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (categoryData) => {
    try {
      const api = getApi();
      const response = await api.post('/products/categories', categoryData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, categoryData) => {
    try {
      const api = getApi();
      const response = await api.put(`/products/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const api = getApi();
      const response = await api.delete(`/products/categories/${id}`, { force: true });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Bulk assign products to category
  // Bulk assign products to category
  bulkAssignProducts: async (categoryId, productIds) => {
    try {
      // We need to get the current categories for each product first
      // to avoid overwriting existing categories.
      // Unfortunately, we can't easily batch the "get" part without a custom endpoint,
      // but we can batch the "update" part.

      // 1. Fetch all products to get their current categories
      // We can use the 'include' parameter to fetch specific products
      const products = await productsAPI.getAll({
        include: productIds.join(','),
        per_page: 100
      });

      // 2. Prepare batch update data
      const updateData = products.map(product => {
        const currentCategoryIds = (product.categories || []).map(cat => cat.id);

        // Skip if already in category
        if (currentCategoryIds.includes(categoryId)) {
          return null;
        }

        return {
          id: product.id,
          categories: [...currentCategoryIds, categoryId].map(id => ({ id }))
        };
      }).filter(Boolean);

      if (updateData.length === 0) {
        return { success: true };
      }

      // 3. Perform batch update
      // WooCommerce batch endpoint accepts chunks of 100
      const chunkSize = 100;
      const updates = [];

      for (let i = 0; i < updateData.length; i += chunkSize) {
        const chunk = updateData.slice(i, i + chunkSize);
        updates.push(productsAPI.batch({ update: chunk }));
      }

      await Promise.all(updates);

      return { success: true };
    } catch (error) {
      handleError(error);
    }
  },
};

// Attributes API
export const attributesAPI = {
  getAll: async (params = {}) => {
    try {
      const { data } = await fetchCollection('/products/attributes', {
        per_page: 100,
        ...params,
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getTerms: async (attributeId, params = {}) => {
    try {
      const { data } = await fetchCollection(`/products/attributes/${attributeId}/terms`, {
        per_page: 100,
        ...params,
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Media API
export const mediaAPI = {
  upload: async (formData) => {
    try {
      const wpApi = createWordPressApiInstance();
      const response = await wpApi.post('/wp/v2/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Variations API
export const variationsAPI = {
  getByProductId: async (productId) => {
    try {
      const { data } = await fetchCollection(`/products/${productId}/variations`, {
        per_page: 100,
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Coupons API
export const couponsAPI = {
  getAll: async (params = {}) => {
    try {
      const { data } = await fetchCollection('/coupons', {
        per_page: 50,
        page: 1,
        ...params,
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  list: async (params = {}) => {
    try {
      return await fetchCollection('/coupons', {
        per_page: 50,
        page: 1,
        ...params,
      });
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const api = getApi();
      const response = await api.get(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (couponData) => {
    try {
      const api = getApi();
      const response = await api.post('/coupons', couponData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, couponData) => {
    try {
      const api = getApi();
      const response = await api.put(`/coupons/${id}`, couponData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const api = getApi();
      const response = await api.delete(`/coupons/${id}`, { force: true });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};
