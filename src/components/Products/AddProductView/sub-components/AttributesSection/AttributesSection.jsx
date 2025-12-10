import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { XMarkIcon as X } from '@heroicons/react/24/outline';
import { Card } from '../../../../ui';
import { useLanguage } from '../../../../../contexts/LanguageContext';

/**
 * AttributesSection Component
 * 
 * @param {Array} attributes - All available attributes
 * @param {Object} attributeTerms - Terms for each attribute: { attributeId: [terms] }
 * @param {Array} selectedAttributeIds - IDs of selected attributes
 * @param {Object} selectedAttributeTerms - Selected terms: { attributeId: [termIds] }
 * @param {boolean} loading - Whether attributes are being loaded
 * @param {function} onToggleAttribute - Callback when attribute is toggled (receives attributeId)
 * @param {function} onToggleTerm - Callback when term is toggled (receives attributeId, termId)
 * @param {function} isAttributeSelected - Function to check if attribute is selected
 * @param {function} isTermSelected - Function to check if term is selected
 */

const AttributesSection = ({
  attributes = [],
  attributeTerms = {},
  selectedAttributeIds = [],
  selectedAttributeTerms = {},
  loading = false,
  onToggleAttribute,
  onToggleTerm,
  isAttributeSelected,
  isTermSelected,
  attributeErrors,
  onRetryLoadTerms,
  onAddVariationClick, // New prop for creating variations
}) => {
  const { t } = useLanguage();
  const { formState: { errors } } = useFormContext();

  const hasSelectedAttributes = selectedAttributeIds.length > 0;
  const hasSelectedTerms = selectedAttributeIds.some(
    attrId => selectedAttributeTerms[attrId]?.length > 0
  );

  return (
    <Card className={`p-6 ${errors.attributes ? 'border-red-300 ring-4 ring-red-50' : ''}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-right">
        {t('attributes') || 'תכונות'}
      </h3>

      {loading ? (
        <div className="text-right py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mr-auto"></div>
          <p className="text-sm text-gray-600 mt-2 text-right">{t('loading') || 'טוען...'}</p>
        </div>
      ) : attributes.length === 0 ? (
        <p className="text-sm text-gray-500 text-right">{t('noAttributes') || 'אין תכונות זמינות'}</p>
      ) : (
        <div className="space-y-6">
          {/* Step 1: Select which attributes to use */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-right">
              {t('selectAttributes') || 'בחר תכונות למוצר'}
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {attributes.map(attribute => (
                <button
                  key={attribute.id}
                  type="button"
                  onClick={() => onToggleAttribute?.(attribute.id)}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm text-center ${isAttributeSelected?.(attribute.id)
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {attribute.name}
                  {isAttributeSelected?.(attribute.id) && (
                    <X className="w-3.5 h-3.5 inline mr-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select terms for selected attributes */}
          {selectedAttributeIds.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              {selectedAttributeIds.map(attributeId => {
                const attribute = attributes.find(attr => attr.id === attributeId);
                if (!attribute) return null;

                const terms = attributeTerms[attributeId];
                const error = attributeErrors?.[attributeId];
                const isLoadingTerms = terms === undefined && !error;

                return (
                  <div key={attributeId} className="border-b border-gray-200 pb-4 last:border-0">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-right">
                      {attribute.name}
                    </label>
                    {error ? (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <span>{t('failedToLoadTerms') || 'שגיאה בטעינת ערכים'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            // Reset terms state for this attribute to undefined to trigger re-fetch logic if needed
                            // But loadAttributeTerms checks if undefined.
                            // We need to force reload.
                            // We can just call onRetryLoadTerms(attributeId) if we passed it.
                            // Or just toggle it off and on? No that clears selection.
                            onRetryLoadTerms?.(attributeId);
                          }}
                          className="underline hover:text-red-700"
                        >
                          {t('retry') || 'נסה שוב'}
                        </button>
                      </div>
                    ) : isLoadingTerms ? (
                      <div className="text-right py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 inline-block"></div>
                        <p className="text-xs text-gray-500 inline mr-2">{t('loading') || 'טוען...'}</p>
                      </div>
                    ) : !terms || terms.length === 0 ? (
                      <p className="text-xs text-gray-500 text-right">
                        {t('noTermsAvailable') || 'אין אפשרויות זמינות לתכונה זו'}
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {terms.map(term => {
                          // Check if this is a color attribute
                          const isColorAttribute = ['color', 'colour', 'צבע', 'colors', 'colours']
                            .some(keyword => attribute.name.toLowerCase().includes(keyword));

                          // Simple color validation (can be enhanced)
                          // We rely on the browser to ignore invalid background colors, but we need to decide strictly for UI
                          const colorValue = term.slug; // Slug is usually English (e.g. 'blue', 'red')

                          // If it's a color attribute, try to render a swatch
                          if (isColorAttribute) {
                            return (
                              <button
                                key={term.id}
                                type="button"
                                onClick={() => onToggleTerm?.(attributeId, term.id)}
                                title={term.name} // Show name on hover
                                className={`
                                  w-8 h-8 rounded-full border-2 transition-all relative flex items-center justify-center
                                  ${isTermSelected?.(attributeId, term.id)
                                    ? 'border-primary-500 ring-2 ring-primary-200 scale-110'
                                    : 'border-gray-200 hover:border-gray-300'
                                  }
                                `}
                                style={{ backgroundColor: colorValue }}
                              >
                                {isTermSelected?.(attributeId, term.id) && (
                                  // Contrast check is complex, so we use a shadowed check icon or ensure visibility
                                  <span className="bg-white rounded-full p-0.5 shadow-sm">
                                    <X className="w-3 h-3 text-primary-600" />
                                  </span>
                                )}
                                {/* Fallback: If background color fails (invalid), the button might look empty. 
                                    Ideally we'd detect this, but CSS fallback requires JS measurement or specific handling.
                                    For now, this assumes slugs are valid colors. 
                                    If user has "Gradient" or "Pattern", it won't work well without custom logic.
                                */}
                              </button>
                            );
                          }

                          // Default Text Button
                          return (
                            <button
                              key={term.id}
                              type="button"
                              onClick={() => onToggleTerm?.(attributeId, term.id)}
                              className={`px-4 py-2 rounded-lg transition-colors text-sm text-center ${isTermSelected?.(attributeId, term.id)
                                ? 'bg-primary-500 text-white hover:bg-primary-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {term.name}
                              {isTermSelected?.(attributeId, term.id) && (
                                <X className="w-3.5 h-3.5 inline mr-1" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Variation Button - Show when attributes and terms are selected */}
          {hasSelectedAttributes && hasSelectedTerms && onAddVariationClick && (
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onAddVariationClick}
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {t('addVariation') || 'צור וריאציה'}
              </button>
            </div>
          )}
        </div>
      )}

      {errors.attributes && (
        <p className="mt-2 text-sm text-red-600 text-right">
          {errors.attributes.message}
        </p>
      )}
    </Card>
  );
};

export default memo(AttributesSection);
