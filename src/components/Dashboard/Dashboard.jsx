import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { productsAPI, ordersAPI, customersAPI, reportsAPI } from '../../services/woocommerce';
import { format } from 'date-fns';

const StatCard = ({ title, value, change, icon: Icon, trend, isRTL }) => {
  const isPositive = trend === 'up';
  
  return (
    <div className="card">
      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} justify-between`}>
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className={isRTL ? 'mr-1' : 'ml-1'}>{change}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary-50 rounded-lg">
          <Icon className="text-primary-500" size={24} />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { t, formatCurrency, isRTL } = useLanguage();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data in parallel (recent orders + entity counts)
      const [
        recentOrdersResponse,
        totalProducts,
        totalOrders,
        totalCustomers,
      ] = await Promise.all([
        ordersAPI.getAll({ per_page: 10, orderby: 'date', order: 'desc' }),
        productsAPI.getTotalCount(),
        ordersAPI.getTotalCount(),
        customersAPI.getTotalCount(),
      ]);

      // Calculate statistics
      const totalRevenue = recentOrdersResponse.reduce(
        (sum, order) => sum + parseFloat(order.total || 0),
        0
      );

      setStats({
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders,
        totalCustomers,
        totalProducts,
      });

      setRecentOrders(recentOrdersResponse.slice(0, 5));
    } catch (err) {
      setError(err.message || t('error'));
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-600 mb-4">
            {t('settings')}
          </p>
          <button onClick={fetchDashboardData} className="btn-primary">
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
        <p className="text-gray-600 mt-1">{t('welcome')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('totalRevenue')}
          value={formatCurrency(stats.totalRevenue)}
          change="+12.5%"
          trend="up"
          icon={DollarSign}
          isRTL={isRTL}
        />
        <StatCard
          title={t('totalOrders')}
          value={stats.totalOrders}
          change="+8.2%"
          trend="up"
          icon={ShoppingCart}
          isRTL={isRTL}
        />
        <StatCard
          title={t('totalCustomers')}
          value={stats.totalCustomers}
          change="+5.1%"
          trend="up"
          icon={Users}
          isRTL={isRTL}
        />
        <StatCard
          title={t('totalProducts')}
          value={stats.totalProducts}
          change="+2.3%"
          trend="up"
          icon={Package}
          isRTL={isRTL}
        />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h2 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('recentOrders')}</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('noOrders')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-medium text-gray-700`}>{t('order')} ID</th>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-medium text-gray-700`}>{t('customer')}</th>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-medium text-gray-700`}>{t('date')}</th>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-medium text-gray-700`}>{t('status')}</th>
                  <th className={`${isRTL ? 'text-left' : 'text-right'} py-3 px-4 text-sm font-medium text-gray-700`}>{t('total')}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className={`py-3 px-4 text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>#{order.id}</td>
                    <td className={`py-3 px-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {order.billing?.first_name} {order.billing?.last_name}
                    </td>
                    <td className={`py-3 px-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {format(new Date(order.date_created), isRTL ? 'dd/MM/yyyy' : 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'text-primary-500' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                      style={order.status === 'processing' ? { backgroundColor: '#EBF3FF' } : {}}
                      >
                        {t(order.status)}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-sm font-medium text-gray-900 ${isRTL ? 'text-left' : 'text-right'}`}>
                      {formatCurrency(parseFloat(order.total || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;



