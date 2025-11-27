import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchInput from '../Common/SearchInput';

/**
 * FiltersModal Component
 * 
 * Modal content for product filters including search, category, and price range.
 * 
 * @param {String} searchQuery - Current search query
 * @param {Function} onSearchChange - Callback when search changes
 * @param {Array} categories - Available categories
 * @param {String} selectedCategory - Currently selected category
 * @param {Function} onCategoryChange - Callback when category changes
 * @param {String} minPrice - Minimum price filter
 * @param {Function} onMinPriceChange - Callback when min price changes
 * @param {String} maxPrice - Maximum price filter
 * @param {Function} onMaxPriceChange - Callback when max price changes
 * @param {Array} products - Products array for calculating price range
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {Function} onClose - Callback to close the modal
 */
const FiltersModal = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  products = [],
  isRTL,
  t,
  onClose
}) => {
  // Calculate price range from products
  const priceRange = products.length > 0 ? products.reduce((acc, product) => {
    const price = parseFloat(product.price || product.regular_price || 0);
    return {
      min: Math.min(acc.min, price),
      max: Math.max(acc.max, price)
    };
  }, { min: Infinity, max: 0 }) : { min: 0, max: 1000 };

  const actualMin = priceRange.min === Infinity ? 0 : Math.floor(priceRange.min);
  const actualMax = priceRange.max === 0 ? 1000 : Math.ceil(priceRange.max);

  // Use state for slider values - initialize with current filter values or range bounds
  const [sliderMin, setSliderMin] = useState(() => {
    return minPrice ? parseFloat(minPrice) : actualMin;
  });
  const [sliderMax, setSliderMax] = useState(() => {
    return maxPrice ? parseFloat(maxPrice) : actualMax;
  });

  // Update slider values when price range changes or filters are cleared
  useEffect(() => {
    if (minPrice === '') {
      setSliderMin(actualMin);
    } else {
      const numValue = parseFloat(minPrice);
      if (!isNaN(numValue)) {
        setSliderMin(numValue);
      }
    }
  }, [minPrice, actualMin]);

  useEffect(() => {
    if (maxPrice === '') {
      setSliderMax(actualMax);
    } else {
      const numValue = parseFloat(maxPrice);
      if (!isNaN(numValue)) {
        setSliderMax(numValue);
      }
    }
  }, [maxPrice, actualMax]);

  const handleMinPriceChange = (value) => {
    const numValue = parseFloat(value);
    if (numValue >= actualMin && numValue <= parseFloat(sliderMax)) {
      setSliderMin(value);
      onMinPriceChange(value);
    }
  };

  const handleMaxPriceChange = (value) => {
    const numValue = parseFloat(value);
    if (numValue <= actualMax && numValue >= parseFloat(sliderMin)) {
      setSliderMax(value);
      onMaxPriceChange(value);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('filters')}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={t('close') || 'Close'}
        >
          <X size={20} />
        </button>
      </div>

      {/* Filters Content */}
      <div className="space-y-4">
        {/* Search by Name or SKU */}
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2`} style={{ textAlign: 'right' }}>
            {t('searchProducts')}
          </label>
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={t('searchProducts')}
            isRTL={isRTL}
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2`} style={{ textAlign: 'right' }}>
            {t('category')}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={`input-field w-full ${'text-right'}`}
            dir="rtl"
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2`} style={{ textAlign: 'right' }}>
            {t('priceRange') || t('price')}
          </label>
          
          {/* Range Sliders */}
          <div className="space-y-4">
            {/* Min Price Slider */}
            <div>
              <div className={`flex items-center ${'flex-row-reverse'} justify-between mb-2`}>
                <span className="text-xs text-gray-500">{t('minPrice')}</span>
                <span className="text-xs font-medium text-gray-700">{sliderMin}</span>
              </div>
              <input
                type="range"
                min={actualMin}
                max={actualMax}
                value={sliderMin}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 ${'direction-rtl'}`}
                dir="rtl"
                style={{
                  background: isRTL
                    ? `linear-gradient(to left, #4560FF 0%, #4560FF ${((sliderMin - actualMin) / (actualMax - actualMin)) * 100}%, #e5e7eb ${((sliderMin - actualMin) / (actualMax - actualMin)) * 100}%, #e5e7eb 100%)`
                    : `linear-gradient(to right, #4560FF 0%, #4560FF ${((sliderMin - actualMin) / (actualMax - actualMin)) * 100}%, #e5e7eb ${((sliderMin - actualMin) / (actualMax - actualMin)) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>

            {/* Max Price Slider */}
            <div>
              <div className={`flex items-center ${'flex-row-reverse'} justify-between mb-2`}>
                <span className="text-xs text-gray-500">{t('maxPrice')}</span>
                <span className="text-xs font-medium text-gray-700">{sliderMax}</span>
              </div>
              <input
                type="range"
                min={actualMin}
                max={actualMax}
                value={sliderMax}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 ${'direction-rtl'}`}
                dir="rtl"
                style={{
                  background: isRTL
                    ? `linear-gradient(to left, #e5e7eb 0%, #e5e7eb ${((sliderMax - actualMin) / (actualMax - actualMin)) * 100}%, #4560FF ${((sliderMax - actualMin) / (actualMax - actualMin)) * 100}%, #4560FF 100%)`
                    : `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${((sliderMax - actualMin) / (actualMax - actualMin)) * 100}%, #4560FF ${((sliderMax - actualMin) / (actualMax - actualMin)) * 100}%, #4560FF 100%)`
                }}
              />
            </div>

            {/* Price Display */}
            <div className={`flex items-center ${'flex-row-reverse'} justify-between text-sm text-gray-600 pt-2 border-t border-gray-200`}>
              <span>{actualMin}</span>
              <span className="font-medium text-gray-900">
                {isRTL ? `${sliderMax} - ${sliderMin}` : `${sliderMin} - ${sliderMax}`}
              </span>
              <span>{actualMax}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FiltersModal;


