import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { customersAPI } from '../../services/woocommerce';
import SearchInput from '../Common/SearchInput';
import CustomerDetailsModal from './CustomerDetailsModal/CustomerDetailsModal';
import CustomersHeader from './CustomersHeader';
import CustomersGrid from './CustomersGrid';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import LoadingMoreIndicator from './LoadingMoreIndicator';

const PER_PAGE = 24;

const Customers = () => {
  const { t, isRTL } = useLanguage();
  const [allCustomers, setAllCustomers] = useState([]); // All loaded customers (no filter)
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Load all customers without filters (for client-side filtering)
  const loadCustomers = useCallback(async (pageToLoad = 1, reset = false) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);
      setError(null);
      
      const { data, total, totalPages } = await customersAPI.list({
        page: pageToLoad,
        per_page: PER_PAGE,
      });
      
      setTotalCustomers(total);
      setHasMore(pageToLoad < totalPages);
      setPage(pageToLoad);
      
      if (reset) {
        setAllCustomers(data);
      } else {
        // Avoid duplicates
        setAllCustomers((prev) => {
          const existingIds = new Set(prev.map(c => c.id));
          const newCustomers = data.filter(c => !existingIds.has(c.id));
          return [...prev, ...newCustomers];
        });
      }
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      reset ? setLoading(false) : setLoadingMore(false);
    }
  }, [t]);

  useEffect(() => {
    loadCustomers(1, true);
  }, [loadCustomers]);

  // Infinite scroll effect - only when no search query
  useEffect(() => {
    if (searchQuery) {
      return; // Don't load more when searching (we filter client-side)
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
            loadCustomers(page + 1, false);
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
          loadCustomers(page + 1, false);
        }
      }, 100);
    };

    if (!loading && allCustomers.length > 0) {
      checkInitialLoad();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkInitialLoad, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkInitialLoad);
    };
  }, [hasMore, loading, loadingMore, page, searchQuery, loadCustomers, allCustomers.length]);

  // Client-side filtering - instant!
  const filteredCustomers = allCustomers.filter(customer => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      customer.first_name?.toLowerCase().includes(query) ||
      customer.last_name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.username?.toLowerCase().includes(query)
    );
  });

  const displayedCount = filteredCustomers.length;

  if (loading) {
    return <LoadingState isRTL={isRTL} t={t} />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <CustomersHeader
        displayedCount={displayedCount}
        totalCount={totalCustomers}
        isRTL={isRTL}
        t={t}
      />

      {/* Search Bar */}
      <div className="card">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('searchCustomers')}
          isRTL={isRTL}
        />
      </div>

      {/* Error State */}
      {error && <ErrorState error={error} isRTL={isRTL} />}

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <EmptyState isRTL={isRTL} t={t} />
      ) : (
        <>
          <CustomersGrid
            customers={filteredCustomers}
            onCustomerClick={setSelectedCustomer}
            isRTL={isRTL}
            t={t}
          />
          {loadingMore && <LoadingMoreIndicator isRTL={isRTL} />}
        </>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          isRTL={isRTL}
          t={t}
        />
      )}
    </div>
  );
};

export default Customers;



