const ProductFilters = ({
  hasActiveFilters,
  onClearFilters,
  isRTL,
  t
}) => {
  return (
    <div>
      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className={`flex items-center ${'justify-start'} mb-2`}>
          <button
            onClick={onClearFilters}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            {t('clearFilters')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;

