import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import StatCard from './StatCard';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * DashboardStats Component
 * 
 * Displays statistics cards for revenue, orders, customers, and products.
 * 
 * @param {Object} stats - Statistics object with totalRevenue, totalOrders, totalCustomers, totalProducts
 * @param {Object} changes - Changes object with percentage changes for each stat
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Function} t - Translation function
 * @param {boolean} isRTL - Whether the layout is right-to-left
 */
const DashboardStats = ({ stats, changes = {}, formatCurrency, t, isRTL }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title={t('totalRevenue')}
        value={formatCurrency(stats.totalRevenue)}
        change={changes.revenue}
        trend={changes.revenue?.startsWith('+') ? 'up' : 'down'}
        icon={DollarSign}
        isRTL={isRTL}
      />
      <StatCard
        title={t('totalOrders')}
        value={stats.totalOrders}
        change={changes.orders}
        trend={changes.orders?.startsWith('+') ? 'up' : 'down'}
        icon={ShoppingCart}
        isRTL={isRTL}
      />
      <StatCard
        title={t('totalCustomers')}
        value={stats.totalCustomers}
        change={changes.customers}
        trend={changes.customers?.startsWith('+') ? 'up' : 'down'}
        icon={Users}
        isRTL={isRTL}
      />
      <StatCard
        title={t('totalProducts')}
        value={stats.totalProducts}
        change={changes.products}
        trend={changes.products?.startsWith('+') ? 'up' : 'down'}
        icon={Package}
        isRTL={isRTL}
      />
    </div>
  );
};

export default DashboardStats;


