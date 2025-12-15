import { memo, useCallback } from 'react';
import {
  DollarOutlined as DollarSign,
  ShoppingCartOutlined as ShoppingCart,
  UserOutlined as Users,
  ExclamationCircleOutlined as AlertTriangle
} from '@ant-design/icons';
import { StatCard } from '../ui';
import { Row, Col } from 'antd';

/**
 * DashboardStats Component
 * 
 * Displays statistics cards for revenue, orders, customers, and low stock products.
 * 
 * @param {Object} stats - Statistics object with totalRevenue, totalOrders, totalCustomers, totalProducts
 * @param {Object} changes - Changes object with percentage changes for each stat
 * @param {number} lowStockCount - Number of products with low/out of stock
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Function} t - Translation function
 * @param {boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} onCardClick - Callback when a card is clicked
 * @param {Function} onLowStockClick - Callback when low stock card is clicked
 */
const DashboardStats = memo(({ stats, changes = {}, lowStockCount = 0, formatCurrency, t, isRTL, onCardClick, onLowStockClick }) => {
  const handleRevenueClick = useCallback(() => onCardClick && onCardClick('revenue'), [onCardClick]);
  const handleOrdersClick = useCallback(() => onCardClick && onCardClick('orders'), [onCardClick]);
  const handleCustomersClick = useCallback(() => onCardClick && onCardClick('customers'), [onCardClick]);
  const handleLowStockClick = useCallback(() => onLowStockClick && onLowStockClick(), [onLowStockClick]);
  return (
    <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title={t('totalRevenue')}
          value={formatCurrency(stats.totalRevenue)}
          change={changes.revenue}
          trend={changes.revenue?.startsWith('+') ? 'up' : 'down'}
          icon={DollarSign}
          isRTL={isRTL}
          onClick={handleRevenueClick}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title={t('totalOrders')}
          value={stats.totalOrders}
          change={changes.orders}
          trend={changes.orders?.startsWith('+') ? 'up' : 'down'}
          icon={ShoppingCart}
          isRTL={isRTL}
          onClick={handleOrdersClick}
          iconBgColor="#CBD5E1"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title={t('totalCustomers')}
          value={stats.totalCustomers}
          change={changes.customers}
          trend={changes.customers?.startsWith('+') ? 'up' : 'down'}
          icon={Users}
          isRTL={isRTL}
          onClick={handleCustomersClick}
          iconBgColor="#2278FC"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title={t('lowStockProducts')}
          value={lowStockCount}
          change={changes.lowStock}
          trend={changes.lowStock?.startsWith('+') ? 'up' : 'down'}
          icon={AlertTriangle}
          isRTL={isRTL}
          onClick={handleLowStockClick}
          iconBgColor="#FF5200"
        />
      </Col>
    </Row>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats;


