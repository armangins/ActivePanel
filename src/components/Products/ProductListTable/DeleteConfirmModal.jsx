import { XMarkIcon as X } from '@heroicons/react/24/outline';
import { Button } from '../../ui';

/**
 * DeleteConfirmModal Component
 * 
 * Modal dialog for confirming product deletion.
 * Displays a confirmation message with Yes and Cancel buttons.
 * 
 * @param {Boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} onConfirm - Callback when user confirms deletion
 * @param {String} productName - Name of the product to delete
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, productName, isRTL, t }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('confirmDelete') || 'Confirm Delete'}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label={t('close') || 'Close'}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700">
              {t('deleteProductConfirm') || 'Are you sure you want to delete this product?'}
            </p>
            {productName && (
              <p className="text-sm font-medium text-gray-900 mt-2">
                {productName}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className={`flex gap-3 ${'flex-row-reverse'} justify-end`}>
            <Button
              variant="secondary"
              onClick={onClose}
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
            >
              {t('yes') || 'Yes'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmModal;


