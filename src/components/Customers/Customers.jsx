import { useState, useEffect, useCallback } from 'react';
import { UserIcon as User } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { customersAPI } from '../../services/woocommerce';
import { useCustomers } from '../../hooks/useCustomers';
import { SearchInput, EmptyState, LoadingState, ErrorState, LoadingMoreIndicator } from '../ui';
import CustomerDetailsModal from './CustomerDetailsModal/CustomerDetailsModal';
import CustomersHeader from './CustomersHeader';
import CustomersGrid from './CustomersGrid';
import Pagination from '../ui/Pagination';
import { PAGINATION_DEFAULTS } from '../../shared/constants';

const PER_PAGE = PAGINATION_DEFAULTS.CUSTOMERS_PER_PAGE;

const Customers = () => {
  const { t, isRTL, formatCurrency } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [page, setPage] = useState(1);

  // Use useCustomers hook for data fetching with caching
  const {
    data: customersData,
    isLoading: loading,
    error
  } = useCustomers({
    page,
    per_page: PER_PAGE,
    search: searchQuery,
    _fields: ['id', 'first_name', 'last_name', 'username', 'email', 'avatar_url', 'billing', 'shipping', 'date_created', 'orders_count', 'total_spent']
  });

  const allCustomers = customersData?.data || [];
  const totalCustomers = customersData?.total || 0;
  const totalPages = customersData?.totalPages || 1;
  const hasMore = page < totalPages;

  // Infinite scroll effect - only when no search query
  // Note: With useQuery, we might want to use useInfiniteQuery for true infinite scroll,
  // but for now we'll stick to the existing pattern or simple pagination.
  // Given the existing code uses a "load more" style with infinite scroll, 
  // let's adapt it to simple pagination for consistency with Products/Orders 
  // OR keep it if we want to maintain that UX.
  // However, the previous implementation was mixing client-side filtering with server-side pagination which is tricky.
  // Let's simplify to server-side pagination/filtering like Products/Orders for better performance and consistency.

  /* 
  // Previous loadCustomers logic removed
  */

  // Client-side filtering - instant!
  // Note: With server-side pagination, client-side filtering only works for the current page.
  // Ideally, we should use server-side search.
  // The useCustomers hook already handles search via the 'search' prop.

  const filteredCustomers = allCustomers; // Search is handled by the hook

  const displayedCount = filteredCustomers.length;

  if (loading) {
    return <LoadingState message={t('loading') || 'Loading customers...'} />;
  }

  if (error && !filteredCustomers.length) {
    return <ErrorState error={error.message || t('error')} fullPage />;
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



      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <EmptyState message={t('noCustomers')} isRTL={isRTL} icon={User} />
      ) : (
        <>
          <CustomersGrid
            customers={filteredCustomers}
            onCustomerClick={setSelectedCustomer}
            isRTL={isRTL}
            t={t}
            formatCurrency={formatCurrency}
          />
          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              totalItems={totalCustomers}
              itemsPerPage={PER_PAGE}
              isRTL={isRTL}
              t={t}
            />
          </div>
        </>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          isRTL={isRTL}
          t={t}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default Customers;



