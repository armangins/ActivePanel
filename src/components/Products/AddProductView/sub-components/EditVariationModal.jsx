import { memo } from 'react';
import { XMarkIcon as X, DocumentArrowDownIcon as Save, ArrowPathIcon as Loader } from '@heroicons/react/24/outline';
import { Card, Button } from '../../../ui';
import VariationForm from './VariationForm';
import { useLanguage } from '../../../../contexts/LanguageContext';

/**
 * EditVariationModal Component
 * 
 * Modal for editing an existing product variation.
 * Uses the shared VariationForm component for the form fields.
 * 
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Callback to close modal
 * @param {Object} formData - Variation form data
 * @param {function} onFormDataChange - Callback when form data changes
 * @param {Array} selectedAttributeIds - IDs of selected attributes
 * @param {Array} attributes - All available attributes
 * @param {Object} attributeTerms - Terms for each attribute
 * @param {boolean} updating - Whether variation is being updated
 * @param {boolean} generatingSKU - Whether SKU is being generated
 * @param {function} onGenerateSKU - Callback to generate SKU
 * @param {string} parentProductName - Parent product name (for SKU generation)
 * @param {function} onSubmit - Callback when form is submitted
 */
const EditVariationModal = ({
  isOpen,
  onClose,
  formData,
  onFormDataChange,
  selectedAttributeIds,
  attributes,
  attributeTerms,
  updating = false,
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
        onClick={() => !updating && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <h3 className="text-xl font-semibold text-gray-800 text-right">
              {t('editVariation') || 'ערוך וריאציה'}
            </h3>
            <button
              onClick={() => !updating && onClose()}
              className="text-gray-400 hover:text-gray-600"
              disabled={updating}
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
            disabled={updating}
          />

          {/* Action Buttons */}
          <div className={`flex gap-3 pt-4 border-t border-gray-200 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={updating}
              isLoading={updating}
              icon={Save}
              className="px-6"
            >
              {t('save')}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={updating}
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

export default memo(EditVariationModal);

