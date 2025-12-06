import { api } from './api';

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
      const err = new Error(data.message);
      err.code = data.code || 'API_ERROR';
      err.status = status;
      throw err;
    }

    if (data?.error) {
      const err = new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
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
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update existing product
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product permanently
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`, { params: { force: true } });
    return response.data;
  },

  // Batch operations (create, update, delete multiple products)
  batch: async (data) => {
    const response = await api.post('/products/batch', data);
    return response.data;
  },
};

// Alias for compatibility with hooks
productsAPI.get = productsAPI.getById;

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
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, orderData) => {
    try {
      const response = await api.put(`/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/reports/sales', {
        params: { period: 'month' },
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
    const { data } = await fetchCollection('/customers', {
      per_page: 50,
      page: 1,
      ...params,
    });
    return data;
  },

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
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (customerData) => {
    try {
      const response = await api.post('/customers', customerData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, customerData) => {
    try {
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
      const response = await api.get('/reports/sales', { params: { period } });
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
      const response = await api.get('/products/categories', {
        params: { per_page: 100, ...params }
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  list: async (params = {}) => {
    return await fetchCollection('/products/categories', {
      per_page: 50,
      page: 1,
      ...params,
    });
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/products/categories/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (categoryData) => {
    try {
      const response = await api.post('/products/categories', categoryData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, categoryData) => {
    try {
      const response = await api.put(`/products/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/products/categories/${id}`, { params: { force: true } });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  bulkAssignProducts: async (categoryId, productIds) => {
    try {
      // This logic might need to move to backend, but for now we can orchestrate it here
      // using the backend endpoints.

      // 1. Fetch products
      const products = await productsAPI.getAll({
        include: productIds.join(','),
        per_page: 100
      });

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
      // Backend should handle media upload to WP
      const response = await api.post('/media', formData, {
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
    const { data } = await fetchCollection('/coupons', {
      per_page: 50,
      page: 1,
      ...params,
    });
    return data;
  },

  list: async (params = {}) => {
    return await fetchCollection('/coupons', {
      per_page: 50,
      page: 1,
      ...params,
    });
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (couponData) => {
    try {
      const response = await api.post('/coupons', couponData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, couponData) => {
    try {
      const response = await api.put(`/coupons/${id}`, couponData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/coupons/${id}`, { params: { force: true } });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};
