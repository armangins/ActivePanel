import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '../../ui';
import { Input } from '../../ui/inputs';

/**
 * BulkDeleteConfirmationModal Component
 * 
 * Modal for confirming bulk deletion of multiple products.
 * Requires user to type "מחק" or "delete" to confirm.
 * 
 * @param {Boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} onConfirm - Callback when deletion is confirmed
 * @param {Number} productCount - Number of products to delete
 * @param {Function} t - Translation function
 */
const BulkDeleteConfirmationModal = ({ isOpen, onClose, onConfirm, productCount, t }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    const text = confirmationText.trim().toLowerCase();

    if (text !== 'מחק' && text !== 'delete') {
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Bulk delete failed', error);
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title={t('bulkDeleteProducts') || 'Delete Products'} onClose={onClose} />

      <ModalBody>
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                {t('warning') || 'Warning'}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {t('bulkDeleteConfirmationMessage')?.replace('{count}', productCount) || `You are about to permanently delete ${productCount} product(s).`}
                </p>
                <p className="mt-1 font-medium">
                  {t('cannotUndo') || 'This action cannot be undone.'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('typeDeleteToConfirm') || 'Type "מחק" or "delete" to confirm'}
            </label>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={t('מחק') || "מחק / delete"}
              className="w-full"
              autoFocus
            />
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
          {t('cancel') || 'Cancel'}
        </Button>
        <Button
          variant="danger"
          onClick={handleConfirm}
          disabled={(confirmationText.trim().toLowerCase() !== 'מחק' && confirmationText.trim().toLowerCase() !== 'delete') || isDeleting}
          isLoading={isDeleting}
        >
          {t('delete') || 'Delete'} ({productCount})
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default BulkDeleteConfirmationModal;

