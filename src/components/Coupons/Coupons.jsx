import { useState, useEffect, useCallback } from 'react';
import { TagIcon as Tag } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { couponsAPI } from '../../services/woocommerce';
import { useCoupons } from '../../hooks/useCoupons';
import CouponModal from './CouponModal';
import CouponsHeader from './CouponsHeader';
import CouponsTable from './CouponsTable';
import Pagination from '../ui/Pagination';
import { EmptyState, LoadingState, ErrorState, LoadingMoreIndicator } from '../ui';
import { PAGINATION_DEFAULTS } from '../../shared/constants';

const PER_PAGE = PAGINATION_DEFAULTS.COUPONS_PER_PAGE;

const Coupons = () => {
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



  // Infinite scroll effect - only when no search query


  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteCoupon') || 'Are you sure you want to delete this coupon?')) {
      return;
    }

    if (selectedCoupon?.id === id) {
      setIsModalOpen(false);
      setSelectedCoupon(null);
    }

    try {
      await couponsAPI.delete(id);
      refetch();
    } catch (err) {
      alert(t('error') + ': ' + err.message);
      refetch();
    }
  };

  // Client-side filtering - instant!
  const filteredCoupons = allCoupons; // Search is handled by the hook

  if (loading && !allCoupons.length) {
    return <LoadingState message={t('loading') || 'Loading...'} />;
  }

  if (error && !allCoupons.length) {
    return <ErrorState error={error.message || t('error')} onRetry={() => refetch()} fullPage />;
  }

  return (
    <div className="space-y-6" dir="rtl">
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
          <CouponsTable
            coupons={filteredCoupons}
            onEdit={(coupon) => {
              setSelectedCoupon(coupon);
              setIsModalOpen(true);
            }}
            onDelete={handleDelete}
            formatCurrency={formatCurrency}
            isRTL={isRTL}
            t={t}
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
              totalItems={totalCoupons}
              itemsPerPage={PER_PAGE}
              isRTL={isRTL}
              t={t}
            />
          </div>
        </>
      )}

      {isModalOpen && (
        <CouponModal
          coupon={selectedCoupon}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCoupon(null);
          }}
          onSave={() => {
            setIsModalOpen(false);
            setSelectedCoupon(null);
            refetch();
          }}
          formatCurrency={formatCurrency}
          isRTL={isRTL}
          t={t}
        />
      )}
    </div>
  );
};

export default Coupons;

