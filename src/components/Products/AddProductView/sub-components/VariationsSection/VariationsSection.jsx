import { memo } from 'react';
import { PlusIcon as Plus, XMarkIcon as X, RectangleStackIcon as Boxes } from '@heroicons/react/24/outline';
import { Card, Button } from '../../../../ui';
import VariationCard from '../../../VariationCard/VariationCard';

/**
 * 
 * @param {Array} variations - Saved variations from API
 * @param {Array} pendingVariations - Local variations not yet saved
 * @param {boolean} loading - Whether variations are being loaded
 * @param {boolean} isEditMode - Whether in edit mode (enables click to edit)
 * @param {function} onAddClick - Callback when "Add Variation" is clicked
 * @param {function} onVariationClick - Callback when variation card is clicked (edit mode only)
 * @param {function} onDeletePending - Callback to delete a pending variation
 * @param {function} formatCurrency - Currency formatter function
 * @param {boolean} isRTL - RTL layout flag
 * @param {function} t - Translation function
 */
const VariationsSection = ({
  variations = [],
  pendingVariations = [],
  loading = false,
  isEditMode = false,
  onAddClick,
  onVariationClick,
  onDeletePending,
  formatCurrency,
  isRTL,
  t,
}) => {
  const hasVariations = variations.length > 0 || pendingVariations.length > 0;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-row-reverse">
        <div className="flex items-center gap-2 flex-row-reverse">
          <Boxes className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800 text-right">
            {t('variations') || 'וריאציות'}
          </h3>
        </div>
        <Button
          variant="primary"
          onClick={onAddClick}
          icon={Plus}
          className="flex-row-reverse"
        >
          {t('addVariation') || 'הוסף וריאציה'}
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-right py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 ml-auto"></div>
          <p className="text-sm text-gray-600 mt-2 text-right">{t('loading') || 'טוען...'}</p>
        </div>
      ) : !hasVariations ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 text-right mb-4">
            {t('noVariationsYet') || 'אין וריאציות עדיין. לחץ על "הוסף וריאציה" כדי להתחיל.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {/* Pending Variations */}
          {pendingVariations.map((variation) => (
            <div
              key={variation.id}
              className="relative group cursor-pointer"
              onClick={() => onVariationClick?.(variation)}
            >
              <VariationCard
                variation={{
                  ...variation,
                  name: variation.attributes?.map(attr => `${attr.name}: ${attr.option}`).join(', ') || 'וריאציה חדשה',
                  price: variation.regular_price,
                  regular_price: variation.regular_price,
                  sale_price: variation.sale_price,
                  sku: variation.sku,
                  stock_quantity: variation.stock_quantity,
                  stock_status: variation.stock_status || 'instock',
                  image: variation.image ? {
                    src: variation.image.src || variation.image.url || variation.image.source_url
                  } : null
                }}
                formatCurrency={formatCurrency}
                isRTL={isRTL}
                t={t}
              />
              {/* Delete button for pending variations */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePending?.(variation.id);
                  }}
                  className="bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-600 shadow-sm backdrop-blur-sm h-7 w-7 rounded-full"
                  title={t('deleteVariation') || 'מחק וריאציה'}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {/* Pending badge */}
              <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                {t('pending') || 'ממתין'}
              </div>
            </div>
          ))}

          {/* Saved Variations */}
          {variations.map((variation) => (
            <div
              key={variation.id}
              onClick={() => onVariationClick?.(variation)}
              className="cursor-pointer"
            >
              <VariationCard
                variation={variation}
                formatCurrency={formatCurrency}
                isRTL={isRTL}
                t={t}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default memo(VariationsSection);

