import VariationCard from '../VariationCard';

/**
 * ProductDetailsVariations Component
 * 
 * Displays product variations for variable products.
 * Shows loading state, error state, or the variations grid.
 * 
 * @param {Array} variations - Array of variation objects
 * @param {Boolean} loadingVariations - Whether variations are loading
 * @param {String} variationsError - Error message if loading failed
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const ProductDetailsVariations = ({
  variations,
  loadingVariations,
  variationsError,
  formatCurrency,
  isRTL,
  t
}) => {
  return (
    <div>
      <div className={`flex items-center justify-between mb-4 ${'flex-row-reverse'}`}>
        <h3 className={`text-lg font-semibold text-gray-900 ${'text-right'}`}>
          {t('variations')} ({variations.length})
        </h3>
      </div>

      {/* Loading State */}
      {loadingVariations && (
        <div className="text-center py-8">
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      )}

      {/* Error State */}
      {variationsError && (
        <div className="text-center py-8">
          <p className="text-orange-500">{variationsError}</p>
        </div>
      )}

      {/* Empty State */}
      {!loadingVariations && !variationsError && variations.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">{t('noVariations')}</p>
        </div>
      )}

      {/* Variations Grid */}
      {!loadingVariations && !variationsError && variations.length > 0 && (
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${'rtl'}`}>
          {variations.map((variation) => (
            <VariationCard
              key={variation.id}
              variation={variation}
              formatCurrency={formatCurrency}
              isRTL={isRTL}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductDetailsVariations;





