import { memo } from 'react';
import { PlusIcon as Plus, XMarkIcon as X, RectangleStackIcon as Boxes } from '@heroicons/react/24/outline';
import { Card } from '../../../ui';
import VariationCard from '../../VariationCard';

/**
 * VariationsSection Component
 * 
 * A clean, focused component for displaying product variations.
 * Separates UI from business logic - all handlers are passed as props.
 * 
 * Features:
 * - Display saved and pending variations
 * - Loading and empty states
 * - Add variation button
 * - Delete pending variations
 * - Click to edit (when in edit mode)
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
        <button
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex-row-reverse"
        >
          <Plus className="w-[18px] h-[18px]" />
          <span>{t('addVariation') || 'הוסף וריאציה'}</span>
        </button>
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
            <div key={variation.id} className="relative group">
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
              <button
                type="button"
                onClick={() => onDeletePending?.(variation.id)}
                className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label={t('deleteVariation') || 'מחק וריאציה'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {/* Pending badge */}
              <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                {t('pending') || 'ממתין'}
              </div>
            </div>
          ))}

          {/* Saved Variations */}
          {variations.map((variation) => (
            <div
              key={variation.id}
              onClick={() => isEditMode && onVariationClick?.(variation)}
              className={isEditMode ? "cursor-pointer" : ""}
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

