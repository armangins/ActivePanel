import { useEffect, useRef } from 'react';
import { Plus, Grid3x3, List, SlidersHorizontal } from 'lucide-react';
import FiltersModal from './FiltersModal';

const ProductsHeader = ({ 
  displayedCount, 
  totalCount, 
  onCreateProduct, 
  viewMode, 
  onViewModeChange, 
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
    <div className={`flex items-center ${'flex-row-reverse'} justify-between`}>
      <div className={`flex items-center ${'flex-row-reverse'} gap-3`}>
        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-primary-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title={t('gridView')}
          >
            <Grid3x3 size={20} />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-primary-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title={t('listView')}
          >
            <List size={20} />
          </button>
        </div>
        
        {/* Filters Button with Modal */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={onToggleFilters}
            className={`flex items-center ${'flex-row-reverse'} gap-2 text-gray-700 hover:text-primary-500 px-4 py-2 rounded-lg border border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-colors`}
          >
            <SlidersHorizontal size={18} />
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
                className={`absolute ${'right-0'} top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-6`}
                dir="rtl"
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
          onClick={onCreateProduct}
          className={`btn-primary flex items-center ${'flex-row-reverse'} gap-2`}
        >
          <Plus size={20} />
          <span>{t('createProduct')}</span>
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
};

export default ProductsHeader;

