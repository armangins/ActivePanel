import { useState, useEffect, useCallback } from 'react';
import { Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ordersAPI } from '../../services/woocommerce';
import SearchInput from '../Common/SearchInput';
import OrderDetailsModal from './OrderDetailsModal/OrderDetailsModal';
import OrdersHeader from './OrdersHeader';
import OrdersTable from './OrdersTable';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import LoadingMoreIndicator from './LoadingMoreIndicator';

const PER_PAGE = 50;

const Orders = () => {
  const { t, formatCurrency, isRTL } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);

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

      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const { data, total, totalPages } = await ordersAPI.list(params);
      
      setTotalOrders(total);
      setHasMore(pageToLoad < totalPages);
      setPage(pageToLoad);
      
      if (reset) {
        setOrders(data);
      } else {
        // Avoid duplicates
        setOrders((prev) => {
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
  }, [statusFilter, t]);

  useEffect(() => {
    loadOrders(1, true);
  }, [loadOrders]); // Reload when status filter changes (loadOrders depends on statusFilter)

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
          if (hasMore && !loading && !loadingMore && !searchQuery) {
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
        
        if (documentHeight <= windowHeight + 100 && hasMore && !loading && !loadingMore) {
          loadOrders(page + 1, false);
        }
      }, 100);
    };

    if (!loading && orders.length > 0) {
      checkInitialLoad();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkInitialLoad, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkInitialLoad);
    };
  }, [hasMore, loading, loadingMore, page, searchQuery, loadOrders, orders.length]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ordersAPI.update(orderId, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      alert(t('error') + ': ' + err.message);
    }
  };

  // Filter orders by search query (client-side filtering)
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      order.id.toString().includes(query) ||
      order.billing?.first_name?.toLowerCase().includes(query) ||
      order.billing?.last_name?.toLowerCase().includes(query) ||
      order.billing?.email?.toLowerCase().includes(query)
    );
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



