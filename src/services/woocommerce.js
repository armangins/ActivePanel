import axios from 'axios';
import { getCachedData, setCachedData, invalidateCache, CACHE_TTL } from './cache';

// WooCommerce API Configuration
// Get credentials from environment variables or localStorage
const getWooCommerceConfig = () => {
  const url = import.meta.env.VITE_WOOCOMMERCE_URL || localStorage.getItem('woocommerce_url') || '';
  const key = import.meta.env.VITE_CONSUMER_KEY || localStorage.getItem('consumer_key') || '';
  const secret = import.meta.env.VITE_CONSUMER_SECRET || localStorage.getItem('consumer_secret') || '';
  
  return { url, key, secret };
};

// Get WordPress Application Password for media uploads (optional)
const getWordPressAuth = () => {
  const appPassword = localStorage.getItem('wordpress_app_password') || '';
  const wpUsername = localStorage.getItem('wordpress_username') || '';
  
  // If Application Password is set, use it; otherwise fall back to WooCommerce credentials
  if (appPassword && wpUsername) {
    // Keep Application Password as-is (with spaces if provided)
    // WordPress Application Password can be used with or without spaces
    const cleanUsername = wpUsername.trim();
    const cleanPassword = appPassword.trim();
    
    console.log('Using WordPress Application Password for media upload');
    console.log('Username:', cleanUsername);
    console.log('Password length:', cleanPassword.length);
    
    return { username: cleanUsername, password: cleanPassword };
  }
  
  // Fall back to WooCommerce credentials
  const { key, secret } = getWooCommerceConfig();
  console.log('Falling back to WooCommerce credentials for media upload');
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
const fetchCollection = async (endpoint, params = {}, useCache = true, ttl = CACHE_TTL.MEDIUM) => {
  // Check cache first if enabled
  if (useCache) {
    const cached = getCachedData(endpoint, params, ttl);
    if (cached) {
      return cached;
    }
  }
  
  const api = getApi();
  const response = await api.get(endpoint, { params });

  const parseHeaderNumber = (value, fallback = 0) => {
    const parsed = parseInt(value ?? fallback, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const result = {
    data: response.data,
    total: parseHeaderNumber(response.headers['x-wp-total']),
    totalPages: parseHeaderNumber(response.headers['x-wp-totalpages'], 1),
  };
  
  // Cache the result if enabled
  if (useCache) {
    setCachedData(endpoint, params, result);
  }
  
  return result;
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
      }, true, CACHE_TTL.MEDIUM); // Cache for 5 minutes
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
      }, true, CACHE_TTL.SHORT); // Cache for 1 minute (products list changes more frequently)
    } catch (error) {
      handleError(error);
    }
  },
  
  getTotalCount: async () => {
    try {
      // Cache total count for longer
      const cached = getCachedData('/products/count', {}, CACHE_TTL.LONG);
      if (cached !== null) {
        return cached;
      }
      
      const { total } = await fetchCollection('/products', { per_page: 1, page: 1 }, false);
      setCachedData('/products/count', {}, total);
      return total;
    } catch (error) {
      handleError(error);
    }
  },

  getLowStockProducts: async (lowStockThreshold = null) => {
    try {
      // Get threshold from localStorage if not provided
      if (lowStockThreshold === null) {
        const savedThreshold = localStorage.getItem('low_stock_threshold');
        lowStockThreshold = savedThreshold ? parseInt(savedThreshold, 10) : 2;
      }
      
      // Get all products (both in stock and out of stock)
      const { data } = await fetchCollection('/products', {
        per_page: 100,
        status: 'publish',
      }, true, CACHE_TTL.SHORT);
      
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
      // Check cache first
      const cached = getCachedData(`/products/${id}`, {}, CACHE_TTL.MEDIUM);
      if (cached) {
        return cached;
      }
      
      const api = getApi();
      const response = await api.get(`/products/${id}`);
      
      // Cache the result
      setCachedData(`/products/${id}`, {}, response.data);
      
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  create: async (productData) => {
    try {
      const api = getApi();
      const response = await api.post('/products', productData);
      
      // Invalidate products cache when creating new product
      invalidateCache('/products');
      
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  update: async (id, productData) => {
    try {
      const api = getApi();
      const response = await api.put(`/products/${id}`, productData);
      
      // Invalidate cache for this product and products list
      invalidateCache('/products');
      invalidateCache(`/products/${id}`);
      
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  delete: async (id) => {
    try {
      const api = getApi();
      const response = await api.delete(`/products/${id}`, { force: true });
      
      // Invalidate products cache when deleting
      invalidateCache('/products');
      invalidateCache(`/products/${id}`);
      
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
      // Check cache first
      const cacheKey = '/orders';
      const cached = getCachedData(cacheKey, params, CACHE_TTL.SHORT);
      if (cached) {
        return cached;
      }
      
      // Try WordPress REST API first (with Application Password if available)
      try {
        const wpApi = createWordPressApiInstance();
        // Ensure per_page doesn't exceed 100 (WooCommerce API limit)
        const safeParams = {
          per_page: Math.min(params.per_page || 50, 100),
          orderby: params.orderby || 'date',
          order: params.order || 'desc',
          page: params.page || 1,
          ...params,
        };
        // Remove per_page if it's invalid
        if (safeParams.per_page > 100) {
          safeParams.per_page = 100;
        }
        
        const response = await wpApi.get('/wc/v3/orders', {
          params: safeParams,
        });
        
        // Cache the result
        setCachedData(cacheKey, params, response.data);
        
        // Return data in same format as fetchCollection
        return response.data;
      } catch (wpError) {
        // Fallback to WooCommerce API
        const safeParams = {
          per_page: Math.min(params.per_page || 50, 100),
          orderby: params.orderby || 'date',
          order: params.order || 'desc',
          page: params.page || 1,
          ...params,
        };
        if (safeParams.per_page > 100) {
          safeParams.per_page = 100;
        }
        
        const { data } = await fetchCollection('/orders', safeParams, true, CACHE_TTL.SHORT);
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
        ...params,
      };
      
      // Check cache first
      const cacheKey = '/orders/list';
      const cached = getCachedData(cacheKey, listParams, CACHE_TTL.SHORT);
      if (cached) {
        return cached;
      }
      
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
        
        // Cache the result
        setCachedData(cacheKey, listParams, result);
        
        return result;
      } catch (wpError) {
        // Fallback to WooCommerce API
        return await fetchCollection('/orders', listParams, true, CACHE_TTL.SHORT);
      }
    } catch (error) {
      handleError(error);
    }
  },
  
  getTotalCount: async () => {
    try {
      // Cache total count for longer
      const cached = getCachedData('/orders/count', {}, CACHE_TTL.LONG);
      if (cached !== null) {
        return cached;
      }
      
      // Try WordPress REST API first (with Application Password if available)
      try {
        const wpApi = createWordPressApiInstance();
        const response = await wpApi.get('/wc/v3/orders', {
          params: { per_page: 1, page: 1 },
        });
        const total = parseInt(response.headers['x-wp-total'] || '0', 10);
        setCachedData('/orders/count', {}, total);
        return total;
      } catch (wpError) {
        // Fallback to WooCommerce API
        const { total } = await fetchCollection('/orders', { per_page: 1, page: 1 }, false);
        setCachedData('/orders/count', {}, total);
        return total;
      }
    } catch (error) {
      handleError(error);
    }
  },
  
  getById: async (id) => {
    try {
      // Check cache first
      const cached = getCachedData(`/orders/${id}`, {}, CACHE_TTL.SHORT);
      if (cached) {
        return cached;
      }
      
      // Use WordPress REST API for order details (with Application Password if available)
      try {
        const wpApi = createWordPressApiInstance();
        const response = await wpApi.get(`/wc/v3/orders/${id}`);
        
        // Cache the result
        setCachedData(`/orders/${id}`, {}, response.data);
        
        return response.data;
      } catch (wpError) {
        // Fallback to WooCommerce API if WordPress API fails
        const api = getApi();
        const response = await api.get(`/orders/${id}`);
        
        // Cache the result
        setCachedData(`/orders/${id}`, {}, response.data);
        
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
        
        // Invalidate cache for this order and orders list
        invalidateCache('/orders');
        invalidateCache(`/orders/${id}`);
        
        return response.data;
      } catch (wpError) {
        // Fallback to WooCommerce API
        const api = getApi();
        const response = await api.put(`/orders/${id}`, orderData);
        
        // Invalidate cache for this order and orders list
        invalidateCache('/orders');
        invalidateCache(`/orders/${id}`);
        
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
        ...params,
      }, true, CACHE_TTL.MEDIUM); // Cache for 5 minutes
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
      }, true, CACHE_TTL.SHORT); // Cache for 1 minute
    } catch (error) {
      handleError(error);
    }
  },
  
  getTotalCount: async () => {
    try {
      // Cache total count for longer
      const cached = getCachedData('/customers/count', {}, CACHE_TTL.LONG);
      if (cached !== null) {
        return cached;
      }
      
      const { total } = await fetchCollection('/customers', { per_page: 1, page: 1 }, false);
      setCachedData('/customers/count', {}, total);
      return total;
    } catch (error) {
      handleError(error);
    }
  },
  
  getById: async (id) => {
    try {
      // Check cache first
      const cached = getCachedData(`/customers/${id}`, {}, CACHE_TTL.MEDIUM);
      if (cached) {
        return cached;
      }
      
      const api = getApi();
      const response = await api.get(`/customers/${id}`);
      
      // Cache the result
      setCachedData(`/customers/${id}`, {}, response.data);
      
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  create: async (customerData) => {
    try {
      const api = getApi();
      const response = await api.post('/customers', customerData);
      
      // Invalidate customers cache
      invalidateCache('/customers');
      
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  update: async (id, customerData) => {
    try {
      const api = getApi();
      const response = await api.put(`/customers/${id}`, customerData);
      
      // Invalidate cache for this customer and customers list
      invalidateCache('/customers');
      invalidateCache(`/customers/${id}`);
      
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
      // Cache sales reports for 5 minutes
      const cached = getCachedData('/reports/sales', { period }, CACHE_TTL.MEDIUM);
      if (cached) {
        return cached;
      }
      
      const api = getApi();
      const response = await api.get('/reports/sales', { params: { period } });
      
      // Cache the result
      setCachedData('/reports/sales', { period }, response.data);
      
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getTopSellers: async () => {
    try {
      // Cache top sellers for 5 minutes
      const cached = getCachedData('/reports/top_sellers', {}, CACHE_TTL.MEDIUM);
      if (cached) {
        return cached;
      }
      
      const api = getApi();
      const response = await api.get('/reports/top_sellers');
      
      // Cache the result
      setCachedData('/reports/top_sellers', {}, response.data);
      
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

// Coupons API
export const couponsAPI = {
  getAll: async (params = {}) => {
    try {
      const { data } = await fetchCollection('/coupons', {
        per_page: 50,
        orderby: 'date',
        order: 'desc',
        page: 1,
        ...params,
      }, true, CACHE_TTL.MEDIUM); // Cache for 5 minutes
      return data;
    } catch (error) {
      handleError(error);
    }
  },
  
  list: async (params = {}) => {
    try {
      return await fetchCollection('/coupons', {
        per_page: 20,
        orderby: 'date',
        order: 'desc',
        page: 1,
        ...params,
      }, true, CACHE_TTL.SHORT); // Cache for 1 minute
    } catch (error) {
      handleError(error);
    }
  },
  
  getTotalCount: async () => {
    try {
      // Cache total count for longer
      const cached = getCachedData('/coupons/count', {}, CACHE_TTL.LONG);
      if (cached !== null) {
        return cached;
      }
      
      const { total } = await fetchCollection('/coupons', { per_page: 1, page: 1 }, false);
      setCachedData('/coupons/count', {}, total);
      return total;
    } catch (error) {
      handleError(error);
    }
  },
  
  getById: async (id) => {
    try {
      // Check cache first
      const cached = getCachedData(`/coupons/${id}`, {}, CACHE_TTL.MEDIUM);
      if (cached) {
        return cached;
      }
      
      const api = getApi();
      const response = await api.get(`/coupons/${id}`);
      
      // Cache the result
      setCachedData(`/coupons/${id}`, {}, response.data);
      
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  create: async (couponData) => {
    try {
      const api = getApi();
      const response = await api.post('/coupons', couponData);
      
      // Invalidate coupons cache
      invalidateCache('/coupons');
      
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  update: async (id, couponData) => {
    try {
      const api = getApi();
      const response = await api.put(`/coupons/${id}`, couponData);
      
      // Invalidate cache for this coupon and coupons list
      invalidateCache('/coupons');
      invalidateCache(`/coupons/${id}`);
      
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  delete: async (id) => {
    try {
      const api = getApi();
      const response = await api.delete(`/coupons/${id}`, { force: true });
      
      // Invalidate coupons cache when deleting
      invalidateCache('/coupons');
      invalidateCache(`/coupons/${id}`);
      
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
      const { url } = getWooCommerceConfig();
      const { username, password } = getWordPressAuth();
      
      console.log('Media upload attempt:', {
        url: url ? `${url}/wp-json/wp/v2/media` : 'missing',
        hasUsername: !!username,
        hasPassword: !!password,
        usernameLength: username?.length || 0,
        passwordLength: password?.length || 0,
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type
      });
      
      if (!url || !username || !password) {
        const missing = [];
        if (!url) missing.push('Store URL');
        if (!username) missing.push('WordPress Username');
        if (!password) missing.push('Application Password');
        throw new Error(`API credentials not configured. Missing: ${missing.join(', ')}. Please configure in Settings.`);
      }
      
      // WordPress REST API endpoint for media
      const formData = new FormData();
      formData.append('file', file);
      
      // Don't set Content-Type header - let axios set it automatically with boundary for FormData
      const response = await axios.post(
        `${url}/wp-json/wp/v2/media`,
        formData,
        {
          auth: {
            username: username,
            password: password,
          },
          // Let axios set Content-Type automatically for FormData with boundary
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );
      
      console.log('Media upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Media upload error:', error);
      
      // Handle specific WordPress REST API errors
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          // WordPress REST API authentication failed
          console.error('Authentication failed. Response:', data);
          const wpUsername = localStorage.getItem('wordpress_username');
          const appPassword = localStorage.getItem('wordpress_app_password');
          
          if (!wpUsername || !appPassword) {
            throw new Error('WordPress Application Password not configured. Please go to Settings and enter your WordPress Username and Application Password.');
          } else {
            throw new Error('Authentication failed. Please verify that your WordPress Username and Application Password are correct. Make sure the Application Password was copied correctly from WordPress (including spaces if present).');
          }
        } else if (status === 403) {
          throw new Error('Access forbidden. Your credentials do not have permission to upload media. Please check user permissions in WordPress.');
        } else if (data?.message) {
          throw new Error(data.message);
        } else if (data?.code === 'rest_upload_invalid_disposition') {
          throw new Error('Invalid file format or file name. Please try a different image.');
        }
        
        throw new Error(`Upload failed: ${data?.code || status}`);
      }
      
      // Re-throw handled errors
      if (error.message && error.message.includes('Authentication')) {
        throw error;
      }
      
      // Fall back to general error handler
      handleError(error);
    }
  },
};

export default getApi;

