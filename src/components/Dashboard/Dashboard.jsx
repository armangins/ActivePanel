import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { productsAPI, ordersAPI, customersAPI, reportsAPI } from '../../services/woocommerce';
import { getTrafficData, getPurchaseEvents, getAddToCartEvents, getRevenueData } from '../../services/ga4';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import RecentOrdersTable from './RecentOrdersTable';
import MostViewedProducts from './MostViewedProducts';
import MostAddedToCartProducts from './MostAddedToCartProducts';
import MostSoldProducts from './MostSoldProducts';
import GA4TrafficCard from './GA4TrafficCard';
import GA4EcommerceCard from './GA4EcommerceCard';
import LowStockCard from './LowStockCard';
import LowStockSidebar from './LowStockSidebar';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const Dashboard = () => {
  const { t, formatCurrency, isRTL } = useLanguage();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [previousStats, setPreviousStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [mostViewedProducts, setMostViewedProducts] = useState([]);
  const [mostAddedToCartProducts, setMostAddedToCartProducts] = useState([]);
  const [mostSoldProducts, setMostSoldProducts] = useState([]);
  const [ga4TrafficData, setGA4TrafficData] = useState(null);
  const [ga4PurchaseData, setGA4PurchaseData] = useState(null);
  const [ga4AddToCartData, setGA4AddToCartData] = useState(null);
  const [ga4RevenueData, setGA4RevenueData] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [previousLowStockCount, setPreviousLowStockCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLowStockSidebarOpen, setIsLowStockSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get date ranges for GA4 (use relative dates like "30daysAgo" and "today")
      const startDate = '30daysAgo';
      const endDate = 'today';

      // Fetch data in parallel - only real API data
      const [
        recentOrdersResponse,
        allOrdersResponse,
        allProductsResponse,
        topSellersResponse,
        totalProducts,
        totalOrders,
        totalCustomers,
        lowStockProducts,
        ga4Traffic,
        ga4Purchases,
        ga4AddToCart,
        ga4Revenue,
      ] = await Promise.all([
        ordersAPI.getAll({ per_page: 10, orderby: 'date', order: 'desc' }),
        ordersAPI.getAll({ per_page: 100, orderby: 'date', order: 'desc' }), // All orders for revenue calculation
        productsAPI.getAll({ per_page: 100 }),
        reportsAPI.getTopSellers().catch(() => []), // Real API data - top sellers
        productsAPI.getTotalCount(),
        ordersAPI.getTotalCount(),
        customersAPI.getTotalCount(),
        productsAPI.getLowStockProducts().catch(() => []), // Low stock products (uses threshold from settings)
        // GA4 data - catch errors silently if not configured
        getTrafficData(startDate, endDate).catch(() => null),
        getPurchaseEvents(startDate, endDate).catch(() => null),
        getAddToCartEvents(startDate, endDate).catch(() => null),
        getRevenueData(startDate, endDate).catch(() => null),
      ]);

      // Calculate TOTAL revenue - ONLY from completed orders (all time)
      // Filter completed orders and calculate total revenue
      const allCompletedOrders = (allOrdersResponse || []).filter(order => {
        return order && order.status === 'completed';
      });
      
      const totalRevenue = allCompletedOrders.reduce(
        (sum, order) => {
          const orderTotal = parseFloat(order.total || 0);
          return sum + (isNaN(orderTotal) ? 0 : orderTotal);
        },
        0
      );
      
      // Debug logging
      console.log('Total orders loaded:', allOrdersResponse?.length || 0);
      console.log('Completed orders:', allCompletedOrders.length);
      console.log('Total revenue:', totalRevenue);

      // Calculate current month revenue for comparison - ONLY from completed orders
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const currentMonthOrders = allCompletedOrders.filter(order => {
        const orderDate = new Date(order.date_created);
        return orderDate >= currentMonthStart;
      });
      
      const currentMonthRevenue = currentMonthOrders.reduce(
        (sum, order) => sum + parseFloat(order.total || 0),
        0
      );

      // Calculate previous month revenue for comparison - ONLY from completed orders
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthOrders = allCompletedOrders.filter(order => {
        const orderDate = new Date(order.date_created);
        return orderDate >= previousMonthStart && orderDate < currentMonthStart;
      });
      
      const previousRevenue = previousMonthOrders.reduce(
        (sum, order) => sum + parseFloat(order.total || 0),
        0
      );

      // Store previous stats for comparison
      setPreviousStats({
        totalRevenue: previousRevenue,
        totalOrders: previousMonthOrders.length,
        totalCustomers: 0,
        totalProducts: 0,
      });

      setStats({
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders,
        totalCustomers,
        totalProducts,
      });

      // Set low stock count and products
      const currentLowStockCount = lowStockProducts?.length || 0;
      setLowStockCount(currentLowStockCount);
      setLowStockProducts(lowStockProducts || []);
      // For now, we'll use 0 as previous (could be enhanced to track over time)
      setPreviousLowStockCount(0);

      setRecentOrders(recentOrdersResponse.slice(0, 5));

      // Most Sold Products - Use REAL API data: total_sales field from WooCommerce
      // total_sales is a real field that WooCommerce tracks automatically
      const productsWithRealSales = allProductsResponse
        .filter(product => product.total_sales && parseInt(product.total_sales, 10) > 0)
        .map(product => ({
          ...product,
          sold_quantity: parseInt(product.total_sales || 0, 10),
        }))
        .sort((a, b) => (b.sold_quantity || 0) - (a.sold_quantity || 0))
        .slice(0, 5);

      setMostSoldProducts(productsWithRealSales);

      // Most Ordered Products - Count from REAL order line_items data
      // This is real data: products that actually appeared in completed orders
      const productOrderCounts = {};
      
      (allOrdersResponse || []).forEach(order => {
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

      // Match with product data from API
      const productsWithOrderData = Object.values(productOrderCounts)
        .map(orderData => {
          const product = allProductsResponse.find(p => p.id === orderData.id);
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

      setMostAddedToCartProducts(productsWithOrderData);

      // Top Sellers from Reports API - REAL API data
      // Use WooCommerce Reports API if available, otherwise use total_sales
      let topSellers = [];
      if (topSellersResponse && Array.isArray(topSellersResponse) && topSellersResponse.length > 0) {
        // Match report data with product data
        topSellers = topSellersResponse
          .slice(0, 5)
          .map(reportItem => {
            const product = allProductsResponse.find(p => p.id === reportItem.product_id);
            return product ? {
              ...product,
              sold_quantity: parseInt(reportItem.quantity || product.total_sales || 0, 10),
            } : null;
          })
          .filter(Boolean);
      } else {
        // Fallback: use total_sales from products (real WooCommerce field)
        topSellers = allProductsResponse
          .filter(product => product.total_sales && parseInt(product.total_sales, 10) > 0)
          .map(product => ({
            ...product,
            sold_quantity: parseInt(product.total_sales || 0, 10),
          }))
          .sort((a, b) => (b.sold_quantity || 0) - (a.sold_quantity || 0))
          .slice(0, 5);
      }

      setMostViewedProducts(topSellers);

      // Set GA4 data
      setGA4TrafficData(ga4Traffic);
      setGA4PurchaseData(ga4Purchases);
      setGA4AddToCartData(ga4AddToCart);
      setGA4RevenueData(ga4Revenue);
    } catch (err) {
      setError(err.message || t('error'));
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate changes
  const changes = {
    revenue: calculateChange(parseFloat(stats.totalRevenue), previousStats.totalRevenue),
    orders: calculateChange(stats.totalOrders, previousStats.totalOrders),
    customers: null, // Would need previous month data
    products: null, // Products don't change month to month
    lowStock: calculateChange(lowStockCount, previousLowStockCount),
  };

  if (loading) {
    return <LoadingState t={t} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchDashboardData} t={t} />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <DashboardHeader t={t} isRTL={isRTL} />

      <DashboardStats
        stats={stats}
        changes={changes}
        formatCurrency={formatCurrency}
        t={t}
        isRTL={isRTL}
      />

      {/* Low Stock Products Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => setIsLowStockSidebarOpen(true)} className="cursor-pointer">
          <LowStockCard
            count={lowStockCount}
            change={changes.lowStock}
            trend={changes.lowStock?.startsWith('+') ? 'up' : 'down'}
          />
        </div>
      </div>

      {/* Low Stock Sidebar */}
      <LowStockSidebar
        isOpen={isLowStockSidebarOpen}
        onClose={() => setIsLowStockSidebarOpen(false)}
        products={lowStockProducts}
        formatCurrency={formatCurrency}
      />

      {/* GA4 Data Section - If configured */}
      {(ga4TrafficData || ga4PurchaseData || ga4AddToCartData || ga4RevenueData) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GA4TrafficCard
            data={ga4TrafficData}
            t={t}
            isRTL={isRTL}
          />
          <GA4EcommerceCard
            purchaseData={ga4PurchaseData}
            addToCartData={ga4AddToCartData}
            revenueData={ga4RevenueData}
            formatCurrency={formatCurrency}
            t={t}
            isRTL={isRTL}
          />
        </div>
      )}

      {/* Recent Orders */}
      <div className="card">
        <h2 className={`text-xl font-semibold text-gray-900 mb-4 ${'text-right'}`}>
          {t('recentOrders')}
        </h2>
        <RecentOrdersTable
          orders={recentOrders}
          formatCurrency={formatCurrency}
          t={t}
          isRTL={isRTL}
        />
      </div>

      {/* Products Grid - Three Column Layout (only real data) */}
      {(mostViewedProducts.length > 0 || mostAddedToCartProducts.length > 0 || mostSoldProducts.length > 0) && (
        <div className={`grid gap-6 ${
          mostViewedProducts.length > 0 && mostAddedToCartProducts.length > 0 && mostSoldProducts.length > 0
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : mostViewedProducts.length > 0 && mostAddedToCartProducts.length > 0
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1'
        }`}>
          {/* Top Sellers (from Reports API or total_sales) */}
          {mostViewedProducts.length > 0 && (
            <div className="card">
              <h2 className={`text-lg font-semibold text-gray-900 mb-4 ${'text-right'}`}>
                {t('topSellers') || 'Top Sellers'}
              </h2>
              <MostViewedProducts
                products={mostViewedProducts}
                formatCurrency={formatCurrency}
                t={t}
                isRTL={isRTL}
              />
            </div>
          )}

          {/* Most Ordered Products (from real orders) */}
          {mostAddedToCartProducts.length > 0 && (
            <div className="card">
              <h2 className={`text-lg font-semibold text-gray-900 mb-4 ${'text-right'}`}>
                {t('mostOrderedProducts') || 'Most Ordered Products'}
              </h2>
              <MostAddedToCartProducts
                products={mostAddedToCartProducts}
                formatCurrency={formatCurrency}
                t={t}
                isRTL={isRTL}
              />
            </div>
          )}

          {/* Most Sold Products */}
          {mostSoldProducts.length > 0 && (
            <div className="card">
              <h2 className={`text-lg font-semibold text-gray-900 mb-4 ${'text-right'}`}>
                {t('mostSoldProducts') || 'Most Sold Products'}
              </h2>
              <MostSoldProducts
                products={mostSoldProducts}
                formatCurrency={formatCurrency}
                t={t}
                isRTL={isRTL}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;



