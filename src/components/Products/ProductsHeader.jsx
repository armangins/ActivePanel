import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon as Plus, Squares2X2Icon as Grid3x3, ListBulletIcon as List, AdjustmentsHorizontalIcon as SlidersHorizontal, ChevronDownIcon as ChevronDown } from '@heroicons/react/24/outline';
import FiltersModal from './FiltersModal';

const ProductsHeader = ({ 
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
  const buttonRef = useRef(null);
  const modalRef = useRef(null);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const columnsMenuRef = useRef(null);

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
      if (
        showColumnsMenu &&
        columnsMenuRef.current &&
        !columnsMenuRef.current.contains(event.target)
      ) {
        setShowColumnsMenu(false);
      }
    };

    if (showFilters || showColumnsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters, showColumnsMenu, onToggleFilters]);

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
            <Grid3x3 className="w-5 h-5" />
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
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Grid Columns Selector - Only show when grid view is active */}
        {viewMode === 'grid' && (
          <div className="relative" ref={columnsMenuRef}>
            <button
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-500 rounded-lg border border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-colors`}
            >
              <span>
                {t('columns') || 'עמודות'}:{' '}
                {/* On mobile, show effective columns (1 or 2) if desktop value is selected */}
                <span className="md:hidden">
                  {[1, 2].includes(gridColumns) ? gridColumns : 1}
                </span>
                <span className="hidden md:inline">{gridColumns}</span>
              </span>
              <ChevronDown className={`w-4 h-4 ${showColumnsMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showColumnsMenu && (
              <>
                {/* Mobile options: 1 or 2 columns */}
                <div className={`md:hidden absolute ${isRTL ? 'right-0' : 'left-0'} top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[120px]`}>
                  {[1, 2].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => {
                        onGridColumnsChange(cols);
                        setShowColumnsMenu(false);
                      }}
                      className={`w-full text-right px-4 py-2 text-sm transition-colors ${
                        gridColumns === cols
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      {cols} {t('columns') || 'עמודות'}
                    </button>
                  ))}
                </div>
                {/* Desktop options: 4, 5, 6 columns */}
                <div className={`hidden md:block absolute ${isRTL ? 'right-0' : 'left-0'} top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[120px]`}>
                  {[4, 5, 6].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => {
                        onGridColumnsChange(cols);
                        setShowColumnsMenu(false);
                      }}
                      className={`w-full text-right px-4 py-2 text-sm transition-colors ${
                        gridColumns === cols
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      {cols} {t('columns') || 'עמודות'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Filters Button with Modal */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={onToggleFilters}
            className={`flex items-center ${'flex-row-reverse'} gap-2 text-gray-700 hover:text-primary-500 px-4 py-2 rounded-lg border border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-colors`}
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
};

export default ProductsHeader;

