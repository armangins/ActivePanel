import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { SearchInput, Button } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * CouponsHeader Component
 * 
 * Header section for the Coupons page.
 * Displays title, coupon count, create button, and search.
 * 
 * @param {Number} totalCount - Total number of coupons
 * @param {Number} displayedCount - Number of coupons currently displayed
 * @param {Function} onCreateCoupon - Callback when create button is clicked
 * @param {String} searchQuery - Current search query
 * @param {Function} onSearchChange - Callback when search query changes
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const CouponsHeader = ({
  totalCount,
  displayedCount,
  onCreateCoupon,
  searchQuery,
  onSearchChange,
  isRTL,
  t,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className={`text-2xl font-bold text-gray-900 ${'text-right'}`}>
          {t('coupons') || 'Coupons'}
        </h1>
        <p className={`text-sm text-gray-600 mt-1 ${'text-right'}`}>
          {t('displayingCoupons') || 'Displaying'} {displayedCount} {t('of') || 'of'} {totalCount} {t('coupons') || 'coupons'}
        </p>
      </div>

      <div className={`flex flex-col sm:flex-row gap-3 ${'sm:flex-row-reverse'}`}>
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={t('searchCoupons') || 'Search coupons by code or description...'}
          isRTL={isRTL}
        />
        <Button
          onClick={onCreateCoupon}
          variant="primary"
          className={`flex items-center ${'flex-row-reverse space-x-reverse'} justify-center`}
        >
          <PlusIcon className="w-[18px] h-[18px]" />
          <span>{t('createCoupon') || 'Create Coupon'}</span>
        </Button>
      </div>
    </div>
  );
};

export default CouponsHeader;
