import { memo } from 'react';
import { XMarkIcon as X } from '@heroicons/react/24/outline';
import { Card } from '../../../ui';
import { useLanguage } from '../../../../contexts/LanguageContext';

/**
 * AttributesSection Component
 * 
 * A clean component for managing product attributes with:
 * - Two-step selection (attributes, then terms)
 * - Loading states
 * - Empty states
 * - Clean separation of UI from business logic
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
}) => {
  const { t } = useLanguage();

  return (
    <Card className="p-6">
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
                  className={`px-4 py-2 rounded-lg transition-colors text-sm text-center ${
                    isAttributeSelected?.(attribute.id)
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
                const isLoadingTerms = terms === undefined;
                
                return (
                  <div key={attributeId} className="border-b border-gray-200 pb-4 last:border-0">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-right">
                      {attribute.name}
                    </label>
                    {isLoadingTerms ? (
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
                        {terms.map(term => (
                          <button
                            key={term.id}
                            type="button"
                            onClick={() => onToggleTerm?.(attributeId, term.id)}
                            className={`px-4 py-2 rounded-lg transition-colors text-sm text-center ${
                              isTermSelected?.(attributeId, term.id)
                                ? 'bg-primary-500 text-white hover:bg-primary-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {term.name}
                            {isTermSelected?.(attributeId, term.id) && (
                              <X className="w-3.5 h-3.5 inline mr-1" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default memo(AttributesSection);

