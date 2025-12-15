import { Button } from '../../ui';

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 8 }}>
          <Button
            variant="ghost"
            onClick={onClearFilters}
            style={{ fontSize: 14, padding: 0, height: 'auto' }}
          >
            {t('clearFilters')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;

