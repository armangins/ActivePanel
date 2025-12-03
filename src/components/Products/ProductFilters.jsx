import { Button } from '../ui';

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
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium p-0 h-auto hover:bg-transparent"
          >
            {t('clearFilters')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;

