import { memo } from 'react';
import { XMarkIcon as X, PlusIcon as Plus, ArrowPathIcon as Loader } from '@heroicons/react/24/outline';
import { Card, Button } from '../../../ui';
import VariationForm from './VariationForm';
import { useLanguage } from '../../../../contexts/LanguageContext';

/**
 * CreateVariationModal Component
 * 
 * Modal for creating a new product variation.
 * Uses the shared VariationForm component for the form fields.
 * 
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Callback to close modal
 * @param {Object} formData - Variation form data
 * @param {function} onFormDataChange - Callback when form data changes
 * @param {Array} selectedAttributeIds - IDs of selected attributes
 * @param {Array} attributes - All available attributes
 * @param {Object} attributeTerms - Terms for each attribute
 * @param {boolean} creating - Whether variation is being created
 * @param {boolean} generatingSKU - Whether SKU is being generated
 * @param {function} onGenerateSKU - Callback to generate SKU
 * @param {string} parentProductName - Parent product name (for SKU generation)
 * @param {function} onSubmit - Callback when form is submitted
 */
const CreateVariationModal = ({
  isOpen,
  onClose,
  formData,
  onFormDataChange,
  selectedAttributeIds,
  attributes,
  attributeTerms,
  creating = false,
  generatingSKU = false,
  onGenerateSKU,
  parentProductName,
  onSubmit,
}) => {
  const { t, isRTL } = useLanguage();

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit?.();
  };

  const canSubmit = selectedAttributeIds.length > 0 && !creating;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
        onClick={() => !creating && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <h3 className="text-xl font-semibold text-gray-800 text-right">
              {t('addVariation') || 'הוסף וריאציה'}
            </h3>
            <button
              onClick={() => !creating && onClose()}
              className="text-gray-400 hover:text-gray-600"
              disabled={creating}
              aria-label={t('close') || 'סגור'}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <VariationForm
            formData={formData}
            onFormDataChange={onFormDataChange}
            selectedAttributeIds={selectedAttributeIds}
            attributes={attributes}
            attributeTerms={attributeTerms}
            generatingSKU={generatingSKU}
            onGenerateSKU={onGenerateSKU}
            parentProductName={parentProductName}
            disabled={creating}
          />

          {/* Action Buttons */}
          <div className={`flex gap-3 pt-4 border-t border-gray-200 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!canSubmit}
              isLoading={creating}
              icon={Plus}
              className="flex-1"
            >
              {creating ? (t('creating') || 'יוצר...') : (t('createVariation') || 'צור וריאציה')}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={creating}
              className="px-6"
            >
              {t('cancel') || 'ביטול'}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default memo(CreateVariationModal);

