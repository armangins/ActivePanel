import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { couponsAPI } from '../../services/woocommerce';
import CouponModal from './CouponModal';
import CouponsHeader from './CouponsHeader';
import CouponsTable from './CouponsTable';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import LoadingMoreIndicator from './LoadingMoreIndicator';

const PER_PAGE = 50;

const Coupons = () => {
  const { t, formatCurrency, isRTL } = useLanguage();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCoupons, setTotalCoupons] = useState(0);

  const loadCoupons = useCallback(async (pageToLoad = 1, reset = false) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);
      setError(null);
      
      const { data, total, totalPages } = await couponsAPI.list({
        page: pageToLoad,
        per_page: PER_PAGE,
        orderby: 'date',
        order: 'desc',
      });
      
      setTotalCoupons(total);
      setHasMore(pageToLoad < totalPages);
      setPage(pageToLoad);
      
      if (reset) {
        setCoupons(data);
      } else {
        // Avoid duplicates
        setCoupons((prev) => {
          const existingIds = new Set(prev.map(c => c.id));
          const newCoupons = data.filter(c => !existingIds.has(c.id));
          return [...prev, ...newCoupons];
        });
      }
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      reset ? setLoading(false) : setLoadingMore(false);
    }
  }, [t]);

  useEffect(() => {
    loadCoupons(1, true);
  }, [loadCoupons]);

  // Infinite scroll effect
  useEffect(() => {
    if (searchQuery) return; // Disable scroll when searching
    
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 200) {
          if (hasMore && !loading && !loadingMore) {
            loadCoupons(page + 1, false);
          }
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loading, loadingMore, page, searchQuery, loadCoupons]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteCoupon') || 'Are you sure you want to delete this coupon?')) {
      return;
    }

    if (selectedCoupon?.id === id) {
      setIsModalOpen(false);
      setSelectedCoupon(null);
    }

    const currentCouponsCount = coupons.length;

    try {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setTotalCoupons((prev) => Math.max(prev - 1, 0));
      
      await couponsAPI.delete(id);
      
      if (currentCouponsCount === 1 && page > 1) {
        loadCoupons(page - 1, true);
      }
    } catch (err) {
      alert(t('error') + ': ' + err.message);
      loadCoupons(page, true);
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      coupon.code?.toLowerCase().includes(query) ||
      coupon.description?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <LoadingState t={t} />;
  }

  if (error && !coupons.length) {
    return <ErrorState error={error} onRetry={() => loadCoupons(1, true)} t={t} />;
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
        <EmptyState isRTL={isRTL} t={t} />
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
          {loadingMore && <LoadingMoreIndicator isRTL={isRTL} />}
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
            loadCoupons(page, true);
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

