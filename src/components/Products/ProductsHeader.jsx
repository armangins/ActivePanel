import { useEffect, useRef, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon as Plus, AdjustmentsHorizontalIcon as SlidersHorizontal } from '@heroicons/react/24/outline';
import FiltersModal from './FiltersModal';
import ViewModeToggle from './ViewModeToggle';
import GridColumnSelector from './GridColumnSelector/GridColumnSelector';

const ProductsHeader = memo(({
  displayedCount,
  totalCount,
  onCreateProduct,
  viewMode,
  onViewModeChange,
  gridColumns,
  onGridColumnsChange,
  isRTL,
  t,
  onToggleFilters,
  hasActiveFilters,
  activeFilterCount,
  showFilters,
  // Filter props for modal
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  products = []
}) => {
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFilters &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        onToggleFilters();
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters, onToggleFilters]);

  return (
    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        {/* View Mode Toggle */}
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          t={t}
        />

        {/* Grid Columns Selector - Only show when grid view is active */}
        {viewMode === 'grid' && (
          <GridColumnSelector
            gridColumns={gridColumns}
            onGridColumnsChange={onGridColumnsChange}
            isRTL={isRTL}
            t={t}
          />
        )}

        {/* Filters Button with Modal */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={onToggleFilters}
            className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2 text-gray-700 hover:text-primary-500 px-4 py-2 rounded-lg border border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-colors`}
          >
            <SlidersHorizontal className="w-[18px] h-[18px]" />
            <span>{t('filters')}</span>
            {hasActiveFilters && (
              <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Filters Modal */}
          {showFilters && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black bg-opacity-20 z-40"
                onClick={onToggleFilters}
              />

              {/* Modal */}
              <div
                ref={modalRef}
                className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-6`}
                dir={isRTL ? 'rtl' : 'ltr'}
                onClick={(e) => e.stopPropagation()}
              >
                <FiltersModal
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={onCategoryChange}
                  minPrice={minPrice}
                  onMinPriceChange={onMinPriceChange}
                  maxPrice={maxPrice}
                  onMaxPriceChange={onMaxPriceChange}
                  products={products}
                  isRTL={isRTL}
                  t={t}
                  onClose={onToggleFilters}
                />
              </div>
            </>
          )}
        </div>

        {/* Create Product Button */}
        <button
          onClick={() => {
            if (onCreateProduct) {
              onCreateProduct();
            } else {
              navigate('/products/add');
            }
          }}
          className={`btn-primary flex items-center justify-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2 md:gap-2 px-3 md:px-4 py-2`}
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden md:inline">{t('createProduct')}</span>
        </button>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('products')}</h1>
        <p className="text-gray-600 mt-1">
          {t('showing')} {displayedCount} {t('of')} {totalCount} {t('products').toLowerCase()}
        </p>
      </div>
    </div>
  );
});

ProductsHeader.displayName = 'ProductsHeader';

export default ProductsHeader;

