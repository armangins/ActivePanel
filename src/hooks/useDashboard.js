import { useQuery } from '@tanstack/react-query';
import { productsAPI, ordersAPI, customersAPI, reportsAPI, batchRequest } from '../services/woocommerce';
import { getTrafficData, getPurchaseEvents, getAddToCartEvents, getRevenueData } from '../services/ga4';
import { useMemo } from 'react';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'],
  stats: () => [...dashboardKeys.all, 'stats'],
  recentOrders: () => [...dashboardKeys.all, 'recentOrders'],
  topSellers: () => [...dashboardKeys.all, 'topSellers'],
  ga4Traffic: () => [...dashboardKeys.all, 'ga4Traffic'],
  ga4Purchase: () => [...dashboardKeys.all, 'ga4Purchase'],
  ga4AddToCart: () => [...dashboardKeys.all, 'ga4AddToCart'],
  ga4Revenue: () => [...dashboardKeys.all, 'ga4Revenue'],
  allProducts: () => [...dashboardKeys.all, 'allProducts'],
  allOrders: () => [...dashboardKeys.all, 'allOrders'],
  allCustomers: () => [...dashboardKeys.all, 'allCustomers'],
  lowStock: () => [...dashboardKeys.all, 'lowStock'],
};

// Fetch dashboard stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      let totalProducts, totalOrders, totalCustomers, allOrdersResponse;

      try {
        // Try batch request first
        const responses = await batchRequest([
          { path: '/wc/v3/products?per_page=1' },
          { path: '/wc/v3/orders?per_page=1' },
          { path: '/wc/v3/customers?per_page=1' },
          { path: '/wc/v3/orders?per_page=100&orderby=date&order=desc' }
        ]);

        if (responses && responses.length === 4) {
          // Helper to get header value case-insensitively
          const getHeader = (headers, key) => {
            if (!headers) return 0;
            const lowerKey = key.toLowerCase();
            const headerKey = Object.keys(headers).find(k => k.toLowerCase() === lowerKey);
            return headers[headerKey];
          };

          totalProducts = parseInt(getHeader(responses[0].headers, 'x-wp-total') || 0, 10);
          totalOrders = parseInt(getHeader(responses[1].headers, 'x-wp-total') || 0, 10);
          totalCustomers = parseInt(getHeader(responses[2].headers, 'x-wp-total') || 0, 10);
          allOrdersResponse = responses[3].body;
        } else {
          throw new Error('Invalid batch response');
        }
      } catch (err) {
        // Fallback to parallel requests
        console.warn('Batch request failed, falling back to parallel requests', err);
        [totalProducts, totalOrders, totalCustomers, allOrdersResponse] = await Promise.all([
          productsAPI.getTotalCount(),
          ordersAPI.getTotalCount(),
          customersAPI.getTotalCount(),
          ordersAPI.getAll({ per_page: 100, orderby: 'date', order: 'desc' }),
        ]);
      }

      // Calculate revenue from completed orders
      const allCompletedOrders = (allOrdersResponse || []).filter(
        order => order && order.status === 'completed'
      );

      const totalRevenue = allCompletedOrders.reduce(
        (sum, order) => {
          const orderTotal = parseFloat(order.total || 0);
          return sum + (isNaN(orderTotal) ? 0 : orderTotal);
        },
        0
      );

      // Calculate previous month stats
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const currentMonthOrders = allCompletedOrders.filter(order => {
        const orderDate = new Date(order.date_created);
        return orderDate >= currentMonthStart;
      });

      const previousMonthOrders = allCompletedOrders.filter(order => {
        const orderDate = new Date(order.date_created);
        return orderDate >= previousMonthStart && orderDate < currentMonthStart;
      });

      const previousRevenue = previousMonthOrders.reduce(
        (sum, order) => sum + parseFloat(order.total || 0),
        0
      );

      return {
        stats: {
          totalRevenue: totalRevenue.toFixed(2),
          totalOrders,
          totalCustomers,
          totalProducts,
        },
        previousStats: {
          totalRevenue: previousRevenue,
          totalOrders: previousMonthOrders.length,
          totalCustomers: 0,
          totalProducts: 0,
        },
        allOrders: allOrdersResponse || [],
      };
    },
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch recent orders
export const useRecentOrders = () => {
  return useQuery({
    queryKey: dashboardKeys.recentOrders(),
    queryFn: () => ordersAPI.getAll({
      per_page: 10,
      orderby: 'date',
      order: 'desc',
      _fields: 'id,number,status,total,date_created,billing,currency,line_items'
    }),
    staleTime: 15 * 60 * 1000,
    select: (data) => data?.slice(0, 5) || [],
  });
};

// Fetch all products for dashboard
export const useDashboardProducts = () => {
  return useQuery({
    queryKey: dashboardKeys.allProducts(),
    queryFn: () => productsAPI.getAll({
      per_page: 100,
      _fields: 'id,name,total_sales,stock_status,stock_quantity,images,price,regular_price,sale_price,status'
    }),
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch all orders for dashboard
export const useDashboardOrders = () => {
  return useQuery({
    queryKey: dashboardKeys.allOrders(),
    queryFn: () => ordersAPI.getAll({
      per_page: 100,
      orderby: 'date',
      order: 'desc',
      _fields: 'id,status,total,date_created,line_items'
    }),
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch all customers for dashboard
export const useDashboardCustomers = () => {
  return useQuery({
    queryKey: dashboardKeys.allCustomers(),
    queryFn: () => customersAPI.getAll({
      per_page: 100,
      _fields: 'id,date_created'
    }),
    staleTime: 15 * 60 * 1000,
    enabled: false, // Only fetch when needed (lazy loading)
  });
};

// Fetch top sellers
export const useTopSellers = () => {
  return useQuery({
    queryKey: dashboardKeys.topSellers(),
    queryFn: () => reportsAPI.getTopSellers({ period: 'month' }),
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch low stock products
export const useDashboardLowStock = () => {
  return useQuery({
    queryKey: dashboardKeys.lowStock(),
    queryFn: () => productsAPI.getLowStockProducts(),
    staleTime: 15 * 60 * 1000,
  });
};

// Compute most sold products from products data
export const useMostSoldProducts = (productsData) => {
  return useMemo(() => {
    if (!productsData || !Array.isArray(productsData)) return [];

    return productsData
      .filter(product => product.total_sales && parseInt(product.total_sales, 10) > 0)
      .map(product => ({
        ...product,
        sold_quantity: parseInt(product.total_sales || 0, 10),
      }))
      .sort((a, b) => (b.sold_quantity || 0) - (a.sold_quantity || 0))
      .slice(0, 5);
  }, [productsData]);
};

// Compute most ordered products from orders and products data
export const useMostOrderedProducts = (ordersData, productsData) => {
  return useMemo(() => {
    if (!ordersData || !Array.isArray(ordersData) || !productsData || !Array.isArray(productsData)) {
      return [];
    }

    const productOrderCounts = {};

    ordersData.forEach(order => {
      if (order && order.line_items && Array.isArray(order.line_items)) {
        order.line_items.forEach(item => {
          const productId = item.product_id;
          if (productId) {
            if (!productOrderCounts[productId]) {
              productOrderCounts[productId] = {
                id: productId,
                name: item.name,
                order_count: 0,
                total_quantity: 0,
              };
            }
            productOrderCounts[productId].order_count += 1;
            productOrderCounts[productId].total_quantity += parseInt(item.quantity || 1, 10);
          }
        });
      }
    });

    return Object.values(productOrderCounts)
      .map(orderData => {
        const product = productsData.find(p => p.id === orderData.id);
        if (product) {
          return {
            ...product,
            order_count: orderData.order_count,
            total_quantity: orderData.total_quantity,
          };
        }
        return {
          id: orderData.id,
          name: orderData.name,
          order_count: orderData.order_count,
          total_quantity: orderData.total_quantity,
          price: 0,
          images: [],
        };
      })
      .sort((a, b) => (b.order_count || 0) - (a.order_count || 0))
      .slice(0, 5);
  }, [ordersData, productsData]);
};

// Compute top sellers from reports and products
export const useTopSellersProducts = (topSellersData, productsData) => {
  return useMemo(() => {
    if (!productsData || !Array.isArray(productsData)) return [];

    if (topSellersData && Array.isArray(topSellersData) && topSellersData.length > 0) {
      return topSellersData
        .slice(0, 5)
        .map(reportItem => {
          const product = productsData.find(p => p.id === reportItem.product_id);
          return product ? {
            ...product,
            sold_quantity: parseInt(reportItem.quantity || product.total_sales || 0, 10),
          } : null;
        })
        .filter(Boolean);
    }

    // Fallback: use total_sales from products
    return productsData
      .filter(product => product.total_sales && parseInt(product.total_sales, 10) > 0)
      .map(product => ({
        ...product,
        sold_quantity: parseInt(product.total_sales || 0, 10),
      }))
      .sort((a, b) => (b.sold_quantity || 0) - (a.sold_quantity || 0))
      .slice(0, 5);
  }, [topSellersData, productsData]);
};

// Fetch GA4 traffic data
export const useGA4Traffic = () => {
  return useQuery({
    queryKey: dashboardKeys.ga4Traffic(),
    queryFn: () => getTrafficData('30daysAgo', 'today'),
    staleTime: 15 * 60 * 1000, // 15 minutes for GA4 data
    retry: false,
  });
};

// Fetch GA4 purchase events
export const useGA4Purchase = () => {
  return useQuery({
    queryKey: dashboardKeys.ga4Purchase(),
    queryFn: () => getPurchaseEvents('30daysAgo', 'today'),
    staleTime: 15 * 60 * 1000,
    retry: false,
  });
};

// Fetch GA4 add to cart events
export const useGA4AddToCart = () => {
  return useQuery({
    queryKey: dashboardKeys.ga4AddToCart(),
    queryFn: () => getAddToCartEvents('30daysAgo', 'today'),
    staleTime: 15 * 60 * 1000,
    retry: false,
  });
};

// Fetch GA4 revenue data
export const useGA4Revenue = () => {
  return useQuery({
    queryKey: dashboardKeys.ga4Revenue(),
    queryFn: () => getRevenueData('30daysAgo', 'today'),
    staleTime: 15 * 60 * 1000,
    retry: false,
  });
};
