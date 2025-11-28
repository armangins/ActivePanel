import { useState, useEffect, useCallback } from 'react';
import { Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ordersAPI } from '../../services/woocommerce';
import SearchInput from '../Common/SearchInput';
import OrderDetailsModal from './OrderDetailsModal/OrderDetailsModal';
import OrdersHeader from './OrdersHeader';
import OrdersTable from './OrdersTable';
import OrderStatusCards from './OrderStatusCards';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import LoadingMoreIndicator from './LoadingMoreIndicator';

const PER_PAGE = 50;

const Orders = () => {
  const { t, formatCurrency, isRTL } = useLanguage();
  const [allOrders, setAllOrders] = useState([]); // All loaded orders (no filter)
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusCounts, setStatusCounts] = useState({});

  // Load orders without status filter (load all orders)
  const loadOrders = useCallback(async (pageToLoad = 1, reset = false) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);
      setError(null);
      
      const params = {
        page: pageToLoad,
        per_page: PER_PAGE,
        orderby: 'date',
        order: 'desc'
      };

      // Don't apply status filter - load all orders
      const { data, total, totalPages } = await ordersAPI.list(params);
      
      setTotalOrders(total);
      setHasMore(pageToLoad < totalPages);
      setPage(pageToLoad);
      
      if (reset) {
        setAllOrders(data);
      } else {
        // Avoid duplicates
        setAllOrders((prev) => {
          const existingIds = new Set(prev.map(o => o.id));
          const newOrders = data.filter(o => !existingIds.has(o.id));
          return [...prev, ...newOrders];
        });
      }
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      reset ? setLoading(false) : setLoadingMore(false);
    }
  }, [t]);

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

  useEffect(() => {
    loadOrders(1, true);
  }, [loadOrders]); // Load all orders once on mount

  // Infinite scroll effect
  useEffect(() => {
    // Only enable infinite scroll when there's no search query
    if (searchQuery) {
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 200) {
          if (hasMore && !loading && !loadingMore && !searchQuery && statusFilter === 'all') {
            loadOrders(page + 1, false);
          }
        }
        ticking = false;
      });
    };

    const checkInitialLoad = () => {
      setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (documentHeight <= windowHeight + 100 && hasMore && !loading && !loadingMore && statusFilter === 'all') {
          loadOrders(page + 1, false);
        }
      }, 100);
    };

    if (!loading && allOrders.length > 0) {
      checkInitialLoad();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkInitialLoad, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkInitialLoad);
    };
  }, [hasMore, loading, loadingMore, page, searchQuery, statusFilter, loadOrders, allOrders.length]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const order = allOrders.find(o => o.id === orderId);
      const oldStatus = order?.status;
      
      await ordersAPI.update(orderId, { status: newStatus });
      setAllOrders(allOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      // Update status counts
      if (oldStatus && oldStatus !== newStatus) {
        setStatusCounts(prev => ({
          ...prev,
          [oldStatus]: Math.max(0, (prev[oldStatus] || 0) - 1),
          [newStatus]: (prev[newStatus] || 0) + 1,
        }));
      }
    } catch (err) {
      alert(t('error') + ': ' + err.message);
    }
  };

  // Filter orders by status and search query (client-side filtering - instant!)
  const filteredOrders = allOrders.filter(order => {
    // Apply status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toString().includes(query) ||
        order.billing?.first_name?.toLowerCase().includes(query) ||
        order.billing?.last_name?.toLowerCase().includes(query) ||
        order.billing?.email?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const displayedCount = filteredOrders.length;

  if (loading) {
    return <LoadingState isRTL={isRTL} t={t} />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <OrdersHeader
        displayedCount={displayedCount}
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

      {/* Error State */}
      {error && <ErrorState error={error} isRTL={isRTL} />}

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState isRTL={isRTL} t={t} />
      ) : (
        <>
          <OrdersTable
            orders={filteredOrders}
            onViewDetails={setSelectedOrder}
            onStatusUpdate={handleStatusUpdate}
            formatCurrency={formatCurrency}
            isRTL={isRTL}
            t={t}
          />
          {loadingMore && <LoadingMoreIndicator isRTL={isRTL} />}
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



