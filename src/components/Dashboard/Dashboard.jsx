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
import DashboardSidebar from './DashboardSidebar';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

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
  const [sidebarState, setSidebarState] = useState({
    type: null, // 'revenue', 'orders', 'customers', 'products', 'recentOrders', 'topSellers', 'mostOrdered', 'mostSold'
    isOpen: false,
  });
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSecondary, setLoadingSecondary] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCriticalData();
    // Load secondary data after a short delay to prioritize critical content
    setTimeout(() => {
      fetchSecondaryData();
    }, 100);
  }, []);

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  // Load critical data first (stats cards) - this is what users see immediately
  const fetchCriticalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch only critical data needed for stats cards
      const [
        totalProducts,
        totalOrders,
        totalCustomers,
        recentOrdersResponse,
        allOrdersResponse,
      ] = await Promise.all([
        productsAPI.getTotalCount(),
        ordersAPI.getTotalCount(),
        customersAPI.getTotalCount(),
        ordersAPI.getAll({ per_page: 10, orderby: 'date', order: 'desc' }),
        ordersAPI.getAll({ per_page: 100, orderby: 'date', order: 'desc' }), // For revenue calculation
      ]);

      // Calculate revenue from completed orders
      const allCompletedOrders = (allOrdersResponse || []).filter(order => 
        order && order.status === 'completed'
      );
      
      const totalRevenue = allCompletedOrders.reduce(
        (sum, order) => {
          const orderTotal = parseFloat(order.total || 0);
          return sum + (isNaN(orderTotal) ? 0 : orderTotal);
        },
        0
      );

      // Calculate previous month revenue for comparison
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

      setRecentOrders(recentOrdersResponse.slice(0, 5));
      setAllOrders(allOrdersResponse || []);
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  // Load secondary data (products, GA4, etc.) - can load after initial render
  const fetchSecondaryData = async () => {
    try {
      setLoadingSecondary(true);

      const startDate = '30daysAgo';
      const endDate = 'today';

      // Fetch secondary data in parallel
      const [
        allProductsResponse,
        topSellersResponse,
        lowStockProducts,
        ga4Traffic,
        ga4Purchases,
        ga4AddToCart,
        ga4Revenue,
      ] = await Promise.all([
        productsAPI.getAll({ per_page: 100 }),
        reportsAPI.getTopSellers().catch(() => []),
        productsAPI.getLowStockProducts().catch(() => []),
        // GA4 data - load in background, catch errors silently
        getTrafficData(startDate, endDate).catch(() => null),
        getPurchaseEvents(startDate, endDate).catch(() => null),
        getAddToCartEvents(startDate, endDate).catch(() => null),
        getRevenueData(startDate, endDate).catch(() => null),
      ]);

      // Set low stock count and products
      const currentLowStockCount = lowStockProducts?.length || 0;
      setLowStockCount(currentLowStockCount);
      setLowStockProducts(lowStockProducts || []);
      setPreviousLowStockCount(0);

      setAllProducts(allProductsResponse || []);

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
      // Use allOrders from state (already loaded in critical data)
      const productOrderCounts = {};
      
      (allOrders || []).forEach(order => {
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
      // Don't show error for secondary data - it's not critical
    } finally {
      setLoadingSecondary(false);
    }
  };

  // Load customers only when sidebar is opened (lazy loading)
  const loadCustomersIfNeeded = async () => {
    if (allCustomers.length === 0 && sidebarState.type === 'customers') {
      try {
        const customersData = await customersAPI.getAll({ per_page: 100 });
        setAllCustomers(customersData || []);
      } catch (err) {
        setAllCustomers([]);
      }
    }
  };

  useEffect(() => {
    if (sidebarState.isOpen && sidebarState.type === 'customers') {
      loadCustomersIfNeeded();
    }
  }, [sidebarState.isOpen, sidebarState.type]);

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
    return <ErrorState error={error} onRetry={fetchCriticalData} t={t} />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <DashboardHeader t={t} isRTL={isRTL} />

      {/* Critical content - shown immediately */}
      <DashboardStats
        stats={stats}
        changes={changes}
        formatCurrency={formatCurrency}
        t={t}
        isRTL={isRTL}
        onCardClick={(type) => {
          setSidebarState({ type, isOpen: true });
        }}
      />

      {/* Low Stock Products Card - Load after critical data */}
      {loadingSecondary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card animate-pulse">
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => setIsLowStockSidebarOpen(true)} className="cursor-pointer">
            <LowStockCard
              count={lowStockCount}
              change={changes.lowStock}
              trend={changes.lowStock?.startsWith('+') ? 'up' : 'down'}
            />
          </div>
        </div>
      )}

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

      {/* Recent Orders - Already loaded with critical data */}
      <div 
        className="card cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setSidebarState({ type: 'recentOrders', isOpen: true })}
      >
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

      {/* Products Grid - Load after secondary data */}
      {loadingSecondary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (mostViewedProducts.length > 0 || mostAddedToCartProducts.length > 0 || mostSoldProducts.length > 0) && (
        <div className={`grid gap-6 ${
          mostViewedProducts.length > 0 && mostAddedToCartProducts.length > 0 && mostSoldProducts.length > 0
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : mostViewedProducts.length > 0 && mostAddedToCartProducts.length > 0
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1'
        }`}>
          {/* Top Sellers (from Reports API or total_sales) */}
          {mostViewedProducts.length > 0 && (
            <div 
              className="card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSidebarState({ type: 'topSellers', isOpen: true })}
            >
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
            <div 
              className="card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSidebarState({ type: 'mostOrdered', isOpen: true })}
            >
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
            <div 
              className="card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSidebarState({ type: 'mostSold', isOpen: true })}
            >
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

      {/* Generic Dashboard Sidebar */}
      <DashboardSidebar
        isOpen={sidebarState.isOpen}
        onClose={() => {
          setSidebarState({ type: null, isOpen: false });
        }}
        title={getSidebarTitle(sidebarState.type, t)}
        subtitle={getSidebarSubtitle(sidebarState.type, t, stats, allOrders, allProducts, allCustomers, mostViewedProducts, mostAddedToCartProducts, mostSoldProducts)}
        icon={getSidebarIcon(sidebarState.type)}
        items={getSidebarItems(sidebarState.type, allOrders, allProducts, allCustomers, mostViewedProducts, mostAddedToCartProducts, mostSoldProducts)}
        renderItem={getSidebarRenderItem(sidebarState.type, t)}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

// Helper functions for sidebar
const getSidebarTitle = (type, t) => {
  if (!type) return '';
  const titles = {
    revenue: t('totalRevenue') || 'סה"כ הכנסות',
    orders: t('totalOrders') || 'סה"כ הזמנות',
    customers: t('totalCustomers') || 'סה"כ לקוחות',
    products: t('totalProducts') || 'סה"כ מוצרים',
    recentOrders: t('recentOrders') || 'הזמנות אחרונות',
    topSellers: t('topSellers') || 'המוצרים הנמכרים ביותר',
    mostOrdered: t('mostOrderedProducts') || 'המוצרים המבוקשים ביותר',
    mostSold: t('mostSoldProducts') || 'המוצרים הנמכרים ביותר',
  };
  return titles[type] || '';
};

const getSidebarSubtitle = (type, t, stats, allOrders, allProducts, allCustomers, mostViewedProducts, mostAddedToCartProducts, mostSoldProducts) => {
  if (!type) return '';
  const subtitles = {
    revenue: `${allOrders.filter(o => o.status === 'completed').length} ${t('completedOrders') || 'הזמנות הושלמו'}`,
    orders: `${allOrders.length} ${t('totalOrders') || 'הזמנות'}`,
    customers: `${allCustomers.length} ${t('customers') || 'לקוחות'}`,
    products: `${allProducts.length} ${t('products') || 'מוצרים'}`,
    recentOrders: `${allOrders.length} ${t('totalOrders') || 'הזמנות'}`,
    topSellers: `${mostViewedProducts?.length || 0} ${t('products') || 'מוצרים'}`,
    mostOrdered: `${mostAddedToCartProducts?.length || 0} ${t('products') || 'מוצרים'}`,
    mostSold: `${mostSoldProducts?.length || 0} ${t('products') || 'מוצרים'}`,
  };
  return subtitles[type] || '';
};

const getSidebarIcon = (type) => {
  if (!type) return null;
  const icons = {
    revenue: DollarSign,
    orders: ShoppingCart,
    customers: Users,
    products: Package,
    recentOrders: ShoppingCart,
    topSellers: Package,
    mostOrdered: Package,
    mostSold: Package,
  };
  return icons[type] || null;
};

const getSidebarItems = (type, allOrders, allProducts, allCustomers, mostViewedProducts, mostAddedToCartProducts, mostSoldProducts) => {
  if (!type) return [];
  switch (type) {
    case 'revenue':
      return allOrders.filter(o => o.status === 'completed');
    case 'orders':
      return allOrders;
    case 'customers':
      return allCustomers;
    case 'products':
      return allProducts;
    case 'recentOrders':
      return allOrders.slice(0, 50).sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
    case 'topSellers':
      return mostViewedProducts || [];
    case 'mostOrdered':
      return mostAddedToCartProducts || [];
    case 'mostSold':
      return mostSoldProducts || [];
    default:
      return [];
  }
};

const getSidebarRenderItem = (type, t) => {
  if (!type) return () => null;
  return (item, formatCurrency) => {
    switch (type) {
      case 'revenue':
      case 'orders':
      case 'recentOrders':
        return (
          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {t('order') || 'הזמנה'} #{item.id}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.status === 'completed' ? 'bg-green-50 text-green-600' : 
                  item.status === 'processing' ? 'bg-blue-50 text-blue-600' : 
                  'bg-gray-50 text-gray-600'
                } font-medium`}>
                  {item.status || 'pending'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(item.date_created).toLocaleDateString('he-IL')}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(item.total)}
              </p>
            </div>
          </div>
        );
      case 'customers':
        return (
          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Users className="text-primary-600" size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {item.first_name || item.last_name 
                  ? `${item.first_name || ''} ${item.last_name || ''}`.trim() 
                  : item.username || item.email || `${t('customer') || 'לקוח'} #${item.id}`}
              </h3>
              {item.email && (
                <p className="text-xs text-gray-500 mb-1">{item.email}</p>
              )}
              {item.username && item.username !== item.email && (
                <p className="text-xs text-gray-500 mb-1">@{item.username}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                {item.orders_count !== undefined && (
                  <span className="text-xs text-gray-600">
                    {item.orders_count} {t('orders') || 'הזמנות'}
                  </span>
                )}
                {item.total_spent !== undefined && item.total_spent > 0 && (
                  <span className="text-xs text-gray-600">
                    {formatCurrency(item.total_spent)} {t('totalSpent') || 'סה"כ הוצא'}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      case 'products':
      case 'topSellers':
      case 'mostOrdered':
      case 'mostSold':
        const imageUrl = item.images && item.images.length > 0 
          ? item.images[0].src 
          : '/placeholder-product.png';
        return (
          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0">
              <img
                src={imageUrl}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = '/placeholder-product.png';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                {item.sold_quantity !== undefined && (
                  <span className="text-xs text-gray-500">
                    {t('sold') || 'נמכר'}: {item.sold_quantity}
                  </span>
                )}
                {item.order_count !== undefined && (
                  <span className="text-xs text-gray-500">
                    {t('orders') || 'הזמנות'}: {item.order_count}
                  </span>
                )}
                {item.sku && (
                  <span className="text-xs text-gray-500">
                    SKU: {item.sku}
                  </span>
                )}
              </div>
              {item.price && (
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.price)}
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };
};

export default Dashboard;



