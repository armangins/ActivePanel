import { useState, lazy, Suspense, memo } from 'react';
import { TagOutlined as Tag } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { couponsAPI } from '../../services/woocommerce';
import { useCoupons } from '../../hooks/useCoupons';
import CouponsHeader from './CouponsHeader';
import CouponsTableSkeleton from './CouponsTableSkeleton';
import Pagination from '../ui/Pagination/Pagination';
import { EmptyState, LoadingState, ErrorState } from '../ui';
import { PAGINATION_DEFAULTS } from '../../shared/constants';
import { validateCouponId } from './utils/securityHelpers';
import { secureLog } from '../../utils/logger';

const CouponModal = lazy(() => import('./CouponModal'));
const CouponsTable = lazy(() => import('./CouponsTable'));

const PER_PAGE = PAGINATION_DEFAULTS.COUPONS_PER_PAGE;

const Coupons = memo(() => {
  const { t, formatCurrency, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Use useCoupons hook for data fetching with caching
  const {
    data: couponsData,
    isLoading: loading,
    error,
    refetch
  } = useCoupons({
    page,
    per_page: PER_PAGE,
    search: searchQuery,
    orderby: 'date',
    order: 'desc'
  });

  const allCoupons = couponsData?.data || [];
  const totalCoupons = couponsData?.total || 0;
  const totalPages = couponsData?.totalPages || 1;


  const handleDelete = async (id) => {
    // SECURITY: Validate coupon ID before processing
    const validId = validateCouponId(id);
    if (!validId) {
      secureLog.warn('Invalid coupon ID for deletion:', id);
      return;
    }
    
    if (!window.confirm(t('deleteCoupon') || 'Are you sure you want to delete this coupon?')) {
      return;
    }

    if (selectedCoupon?.id === validId) {
      setIsModalOpen(false);
      setSelectedCoupon(null);
    }

    try {
      await couponsAPI.delete(validId);
      refetch();
    } catch (err) {
      // SECURITY: Don't expose full error message to user
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? err.message 
        : (err.code === 'NETWORK_ERROR' 
            ? t('networkError') || 'Network error. Please check your connection.'
            : t('error') || 'An error occurred');
      alert(errorMessage);
      secureLog.warn('Coupon deletion error:', err);
      refetch();
    }
  };

  // Client-side filtering - instant!
  const filteredCoupons = allCoupons; // Search is handled by the hook

  // PERFORMANCE: Show skeleton loading for better perceived performance
  if (loading && !allCoupons.length) {
    return (
      <div style={{ direction: 'rtl' }}>
        <CouponsHeader
          totalCount={0}
          displayedCount={0}
          onCreateCoupon={() => {
            setSelectedCoupon(null);
            setIsModalOpen(true);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isRTL={isRTL}
          t={t}
        />
        <CouponsTableSkeleton count={10} />
      </div>
    );
  }

  if (error && !allCoupons.length) {
    // SECURITY: Don't expose full error message in production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : t('error') || 'An error occurred';
    return <ErrorState error={errorMessage} onRetry={() => refetch()} fullPage />;
  }

  return (
    <div style={{ direction: 'rtl' }}>
      <CouponsHeader
        totalCount={totalCoupons}
        displayedCount={filteredCoupons.length}
        onCreateCoupon={() => {
          setSelectedCoupon(null);
          setIsModalOpen(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isRTL={isRTL}
        t={t}
      />

      {filteredCoupons.length === 0 ? (
        <EmptyState message={t('noCoupons') || 'No coupons found'} description={t('noCouponsDesc') || 'Get started by creating your first coupon'} isRTL={isRTL} icon={Tag} />
      ) : (
        <>
          <Suspense fallback={<CouponsTableSkeleton count={filteredCoupons.length} />}>
            <CouponsTable
              coupons={filteredCoupons}
              isLoading={loading}
              onEdit={(coupon) => {
                setSelectedCoupon(coupon);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
              formatCurrency={formatCurrency}
              isRTL={isRTL}
              t={t}
            />
          </Suspense>
          {/* Pagination */}
          <div style={{ marginTop: 24 }}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              totalItems={totalCoupons}
              itemsPerPage={PER_PAGE}
              isRTL={isRTL}
              t={t}
            />
          </div>
        </>
      )}

      {isModalOpen && (
        <Suspense fallback={null}>
          <CouponModal
            coupon={selectedCoupon}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCoupon(null);
            }}
            onSave={() => {
              setIsModalOpen(false);
              setSelectedCoupon(null);
              // Reset to page 1 to show the newly created coupon (sorted by date desc)
              setPage(1);
              // React Query mutations will automatically invalidate and refetch,
              // but we also call refetch here for immediate update
              refetch();
            }}
            formatCurrency={formatCurrency}
            isRTL={isRTL}
            t={t}
          />
        </Suspense>
      )}
    </div>
  );
});

Coupons.displayName = 'Coupons';

export default Coupons;

