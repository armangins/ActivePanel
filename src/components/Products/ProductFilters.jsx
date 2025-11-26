import { Search, Filter } from 'lucide-react';

const ProductFilters = ({
  showFilters,
  onToggleFilters,
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  hasActiveFilters,
  activeFilterCount,
  onClearFilters,
  isRTL,
  t
}) => {
  return (
    <div className="space-y-4">
      {/* Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={onToggleFilters}
          className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} space-x-2 text-gray-700 hover:text-primary-500 px-4 py-2 rounded-lg border border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-colors`}
        >
          <Filter size={18} />
          <span>{t('filters')}</span>
          {hasActiveFilters && (
            <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card">
          <div className="space-y-4">
            {/* Search by Name or SKU */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {t('searchProducts')}
              </label>
              <div className="relative">
                {/* Icon always on the left side */}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={t('searchProducts')}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className={`input-field pl-10 ${isRTL ? 'text-right' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {t('category')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className={`input-field ${isRTL ? 'text-right' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="">{t('allCategories')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price Filter */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {t('minPrice')}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => onMinPriceChange(e.target.value)}
                  className={`input-field ${isRTL ? 'text-right' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Max Price Filter */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {t('maxPrice')}
                </label>
                <input
                  type="number"
                  placeholder="∞"
                  value={maxPrice}
                  onChange={(e) => onMaxPriceChange(e.target.value)}
                  className={`input-field ${isRTL ? 'text-right' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;

