import axios from 'axios';

// WooCommerce API Configuration
// Get credentials from environment variables or localStorage
const getWooCommerceConfig = () => {
  const url = import.meta.env.VITE_WOOCOMMERCE_URL || localStorage.getItem('woocommerce_url') || '';
  const key = import.meta.env.VITE_CONSUMER_KEY || localStorage.getItem('consumer_key') || '';
  const secret = import.meta.env.VITE_CONSUMER_SECRET || localStorage.getItem('consumer_secret') || '';
  
  return { url, key, secret };
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

// Get API instance (recreated on each call to get latest credentials)
const getApi = () => createApiInstance();

// Helper function to handle API errors
const handleError = (error) => {
  console.error('WooCommerce API Error:', error);
  
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
  const response = await api.get(endpoint, { params });

  const parseHeaderNumber = (value, fallback = 0) => {
    const parsed = parseInt(value ?? fallback, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  return {
    data: response.data,
    total: parseHeaderNumber(response.headers['x-wp-total']),
    totalPages: parseHeaderNumber(response.headers['x-wp-totalpages'], 1),
  };
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
};

// Orders API
export const ordersAPI = {
  getAll: async (params = {}) => {
    try {
      const { data } = await fetchCollection('/orders', {
        per_page: 50,
        orderby: 'date',
        order: 'desc',
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
      return await fetchCollection('/orders', {
        per_page: 20,
        orderby: 'date',
        order: 'desc',
        page: 1,
        ...params,
      });
    } catch (error) {
      handleError(error);
    }
  },
  
  getTotalCount: async () => {
    try {
      const { total } = await fetchCollection('/orders', { per_page: 1, page: 1 });
      return total;
    } catch (error) {
      handleError(error);
    }
  },
  
  getById: async (id) => {
    try {
      const api = getApi();
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  update: async (id, orderData) => {
    try {
      const api = getApi();
      const response = await api.put(`/orders/${id}`, orderData);
      return response.data;
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
      const api = getApi();
      const queryParams = {
        per_page: 100,
        ...params,
      };
      const response = await api.get('/products/categories', { params: queryParams });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Attributes API
export const attributesAPI = {
  getAll: async (params = {}) => {
    try {
      const api = getApi();
      const queryParams = {
        per_page: 100,
        ...params,
      };
      const response = await api.get('/products/attributes', { params: queryParams });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getTerms: async (attributeId, params = {}) => {
    try {
      const api = getApi();
      const queryParams = {
        per_page: 100,
        ...params,
      };
      const response = await api.get(`/products/attributes/${attributeId}/terms`, { params: queryParams });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Variations API
export const variationsAPI = {
  getByProductId: async (productId, params = {}) => {
    try {
      const api = getApi();
      const queryParams = {
        per_page: 100,
        ...params,
      };
      const response = await api.get(`/products/${productId}/variations`, { params: queryParams });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getById: async (productId, variationId) => {
    try {
      const api = getApi();
      const response = await api.get(`/products/${productId}/variations/${variationId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  create: async (productId, variationData) => {
    try {
      const api = getApi();
      const response = await api.post(`/products/${productId}/variations`, variationData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  update: async (productId, variationId, variationData) => {
    try {
      const api = getApi();
      const response = await api.put(`/products/${productId}/variations/${variationId}`, variationData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  delete: async (productId, variationId) => {
    try {
      const api = getApi();
      const response = await api.delete(`/products/${productId}/variations/${variationId}`, { force: true });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Media/Images API - Uses WordPress REST API
export const mediaAPI = {
  upload: async (file) => {
    try {
      const { url, key, secret } = getWooCommerceConfig();
      
      if (!url || !key || !secret) {
        throw new Error('WooCommerce API credentials not configured.');
      }
      
      // WordPress REST API endpoint for media
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        `${url}/wp-json/wp/v2/media`,
        formData,
        {
          auth: {
            username: key,
            password: secret,
          },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

export default getApi;

