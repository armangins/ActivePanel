import { useState, useEffect, useCallback } from 'react';
import { CubeIcon as Package } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { ordersAPI } from '../../services/woocommerce';
import { useOrders } from '../../hooks/useOrders';
import { SearchInput, EmptyState, LoadingState, ErrorState } from '../ui';
import Pagination from '../ui/Pagination';
import OrderDetailsModal from './OrderDetailsModal/OrderDetailsModal';
import OrdersHeader from './OrdersHeader';
import OrdersTable from './OrdersTable';
import OrderStatusCards from './OrderStatusCards';
import { PAGINATION_DEFAULTS } from '../../shared/constants';

const PER_PAGE = 10; // Use 10 items per page as requested for Products

const Orders = () => {
  const { t, formatCurrency, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [statusCounts, setStatusCounts] = useState({});

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when status filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // Use useOrders hook for data fetching with caching
  const {
    data: ordersData,
    isLoading: loading,
    error,
    refetch
  } = useOrders({
    page,
    per_page: PER_PAGE,
    search: debouncedSearch,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    orderby: 'date',
    order: 'desc'
  });

  const orders = ordersData?.data || [];
  const totalOrders = ordersData?.total || 0;
  const totalPages = ordersData?.totalPages || 1;

  const loadStatusCounts = useCallback(async () => {
    try {
      const statuses = ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded'];
      const counts = {};

      // Get total count for all orders
      const allOrdersData = await ordersAPI.list({ per_page: 1 });
      counts.all = allOrdersData.total || 0;

      // Get count for each status
      await Promise.all(
        statuses.map(async (status) => {
          try {
            const statusData = await ordersAPI.list({ status, per_page: 1 });
            counts[status] = statusData.total || 0;
          } catch (err) {
            counts[status] = 0;
          }
        })
      );

      setStatusCounts(counts);
    } catch (err) {
      // Failed to load status counts
      setStatusCounts({});
    }
  }, []);

  useEffect(() => {
    loadStatusCounts();
  }, [loadStatusCounts]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      const oldStatus = order?.status;

      await ordersAPI.update(orderId, { status: newStatus });

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      // Update status counts locally to avoid refetching
      if (oldStatus && oldStatus !== newStatus) {
        setStatusCounts(prev => ({
          ...prev,
          [oldStatus]: Math.max(0, (prev[oldStatus] || 0) - 1),
          [newStatus]: (prev[newStatus] || 0) + 1,
        }));
      }

      // If we are filtering by status, we might need to remove the order from the list
      // But for better UX, we keep it until refresh or page change
    } catch (err) {
      alert(t('error') + ': ' + err.message);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (error && !orders.length) {
    return <ErrorState error={error.message || t('error')} onRetry={() => refetch()} fullPage />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <OrdersHeader
        displayedCount={orders.length}
        totalCount={totalOrders}
        isRTL={isRTL}
        t={t}
      />

      {/* Order Status Cards */}
      <OrderStatusCards
        statusCounts={statusCounts}
        onStatusClick={(status) => setStatusFilter(status)}
        selectedStatus={statusFilter}
      />

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('searchOrders')}
            isRTL={isRTL}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
            dir="rtl"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="processing">{t('processing')}</option>
            <option value="on-hold">{t('onHold')}</option>
            <option value="completed">{t('completed')}</option>
            <option value="cancelled">{t('cancelled')}</option>
            <option value="refunded">{t('refunded')}</option>
          </select>
        </div>
      </div>



      {/* Orders Table */}
      {loading ? (
        <LoadingState message={t('loading') || 'Loading orders...'} />
      ) : orders.length === 0 ? (
        <EmptyState message={t('noOrdersFound') || t('noOrders')} isRTL={isRTL} icon={Package} />
      ) : (
        <>
          <OrdersTable
            orders={orders}
            onViewDetails={setSelectedOrder}
            onStatusUpdate={handleStatusUpdate}
            formatCurrency={formatCurrency}
            isRTL={isRTL}
            t={t}
          />

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalOrders}
              itemsPerPage={PER_PAGE}
              isRTL={isRTL}
              t={t}
            />
          </div>
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
          formatCurrency={formatCurrency}
          isRTL={isRTL}
          t={t}
        />
      )}
    </div>
  );
};

export default Orders;
