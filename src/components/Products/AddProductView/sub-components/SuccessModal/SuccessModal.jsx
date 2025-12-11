import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../../../contexts/LanguageContext';

/**
 * SuccessModal Component
 * 
 * Displays a success message after product creation/update
 * with options to create another product or go to products page
 * 
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Callback to close modal
 * @param {function} onCreateAnother - Callback to create another product (clears form)
 * @param {function} onGoToProducts - Callback to navigate to products page
 * @param {string} action - Action type: 'create' or 'update'
 */
const SuccessModal = ({ 
  isOpen, 
  onClose, 
  onCreateAnother,
  onGoToProducts,
  action = 'create' 
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleCreateAnother = () => {
    onCreateAnother?.();
  };

  const handleGoToProducts = () => {
    onGoToProducts?.();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {action === 'update'
                ? (t('productUpdatedSuccessfully') || 'המוצר עודכן בהצלחה!')
                : (t('productCreatedSuccessfully') || 'המוצר נוצר בהצלחה!')
              }
            </h3>
            <p className="text-gray-600">
              {t('wouldYouLikeToCreateAnother') || 'האם תרצה להוסיף מוצר נוסף?'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCreateAnother}
              className="w-full bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center font-medium"
            >
              {t('createAnotherProduct') || 'כן, הוסף מוצר נוסף'}
            </button>
            <button
              onClick={handleGoToProducts}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center font-medium"
            >
              {t('goToProducts') || 'עבור לעמוד המוצרים'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(SuccessModal);
