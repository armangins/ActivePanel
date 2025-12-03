import { api } from './api';

// Helper function to handle API errors
const handleError = (error) => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Handle specific error cases
    if (status === 401) {
      throw new Error('Authentication failed. Please check your API credentials in Settings.');
    } else if (status === 403) {
      throw new Error('Access forbidden. Please check your API key permissions.');
    } else if (status === 404) {
      throw new Error('Resource not found.');
    } else if (status === 500) {
      throw new Error('Server error. Please check your WooCommerce store.');
    } else if (data?.message) {
      throw new Error(data.message);
    } else if (data?.code) {
      throw new Error(`API Error: ${data.code}`);
    }
    throw new Error(`API request failed with status ${status}`);
  } else if (error.request) {
    throw new Error('Unable to connect to the server. Please check your internet connection.');
  }

  throw new Error(error.message || 'Network error');
};

// Helper for collection endpoints to expose pagination metadata
const fetchCollection = async (endpoint, params = {}) => {
  // Handle _fields parameter
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

    const result = {
      data: response.data,
      total: parseHeaderNumber(response.headers['x-wp-total']),
      totalPages: parseHeaderNumber(response.headers['x-wp-totalpages'], 1),
    };

    return result;
  } catch (error) {
    handleError(error);
  }
};

// Generic Batch API
export const batchRequest = async (requests) => {
  try {
    // The backend should expose a batch endpoint, or we map this to the backend's batch handler
    // Assuming backend exposes /batch or /products/batch
    // For now, let's assume the backend proxies /batch/v1
    const response = await api.post('/batch/v1', {
      requests: requests.map(req => ({
        method: req.method || 'GET',
        path: req.path,
        body: req.body,
        headers: req.headers || {},
      })),
    });

    return response.data.responses ? response.data.responses : response.data;
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
  getAll: async (params = {}) => {
    try {
      const { data } = await fetchCollection('/products', {
        per_page: 50,
        page: 1,
        ...params,
      });
      return data;
    } catch (error) {
      // Error is already handled in fetchCollection but re-throwing for consistency if needed
      // fetchCollection calls handleError which throws.
      // So we don't need to catch here unless we want to add context.
      // But existing code catches and calls handleError again? 
      // fetchCollection catches, calls handleError (throws).
      // So this catch block catches the thrown error.
      // Calling handleError AGAIN on an error that is already processed might be redundant but safe.
      throw error;
    }
  },

  list: async (params = {}) => {
    return await fetchCollection('/products', {
      per_page: 24,
      page: 1,
      ...params,
    });
  },

  getTotalCount: async () => {
    const { total } = await fetchCollection('/products', { per_page: 1, page: 1 });
    return total;
  },

  getLowStockProducts: async (lowStockThreshold = 2) => {
    try {
      // We can pass the threshold to the backend if it supports filtering,
      // or fetch all and filter here. 
      // Ideally backend should handle this: /api/products/low-stock?threshold=2
      // But to preserve existing logic with new backend proxy:

      const { data } = await fetchCollection('/products', {
        per_page: 100,
        status: 'publish',
      });

      const lowStockProducts = data.filter(product => {
        if (product.stock_status === 'outofstock') return true;
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
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`, { params: { force: true } });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  batch: async (data) => {
    try {
      const response = await api.post('/products/batch', data);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

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

  getTopSellers: async () => {
    try {
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
      const response = await api.post('/wp/v2/media', formData, {
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
