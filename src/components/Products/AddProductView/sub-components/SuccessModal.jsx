import { CheckCircleIcon as CheckCircle } from '@heroicons/react/24/outline';
import Modal from '../../../ui/modals/Modal';
import { useLanguage } from '../../../../contexts/LanguageContext';

/**
 * SuccessModal Component
 * 
 * Displays success message after product creation/update.
 */
const SuccessModal = ({ isOpen, onClose, isEditMode, onConfirm }) => {
  const { t, isRTL } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onConfirm}
      size="sm"
      closeOnOverlayClick={true}
    >
      <div className="p-8 flex flex-col items-center justify-center text-center min-h-[300px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
          {isEditMode ? t('productUpdated') || 'המוצר עודכן בהצלחה' : t('productCreated') || 'המוצר נוצר בהצלחה'}
        </h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          {isEditMode 
            ? t('productUpdatedMessage') || 'המוצר עודכן בהצלחה במערכת.'
            : t('productCreatedMessage') || 'המוצר נוצר בהצלחה במערכת.'
          }
        </p>
        <button
          onClick={onConfirm}
          className="w-full max-w-xs bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors text-center"
        >
          {t('ok') || 'אישור'}
        </button>
      </div>
    </Modal>
  );
};

export default SuccessModal;

