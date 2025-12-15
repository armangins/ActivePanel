import React from 'react';
import FiltersModalSearch from './FiltersModalSearch';
import FiltersModalCategory from './FiltersModalCategory';
import FiltersModalPriceRange from './FiltersModalPriceRange';

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
    // Use only regular_price - do not use 'price' field as it may include tax calculations
    const price = parseFloat(product.regular_price || 0);
    return {
      min: Math.min(acc.min, price),
      max: Math.max(acc.max, price)
    };
  }, { min: Infinity, max: 0 }) : { min: 0, max: 1000 };

  const actualMin = priceRange.min === Infinity ? 0 : Math.floor(priceRange.min);
  const actualMax = priceRange.max === 0 ? 1000 : Math.ceil(priceRange.max);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <FiltersModalSearch
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          t={t}
          isRTL={isRTL}
        />

        <FiltersModalCategory
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          categories={categories}
          t={t}
        />

        <FiltersModalPriceRange
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={onMinPriceChange}
          onMaxPriceChange={onMaxPriceChange}
          actualMin={actualMin}
          actualMax={actualMax}
          t={t}
          isRTL={isRTL}
        />
    </div>
  );
};

export default FiltersModal;


