import { useState, useEffect } from 'react';
import { Modal, Button, Input, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { secureLog } from '../../../utils/logger';

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
      secureLog.error('Bulk delete failed', error);
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={t('bulkDeleteProducts') || 'Delete Products'}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isDeleting}>
          {t('cancel') || 'Cancel'}
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          onClick={handleConfirm}
          disabled={(confirmationText.trim().toLowerCase() !== 'מחק' && confirmationText.trim().toLowerCase() !== 'delete') || isDeleting}
          loading={isDeleting}
        >
          {t('delete') || 'Delete'} ({productCount})
        </Button>
      ]}
      width={520}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Alert
          message={t('warning') || 'Warning'}
          description={
            <div>
              <p>{t('bulkDeleteConfirmationMessage')?.replace('{count}', productCount) || `You are about to permanently delete ${productCount} product(s).`}</p>
              <p style={{ marginTop: 8, fontWeight: 500 }}>{t('cannotUndo') || 'This action cannot be undone.'}</p>
            </div>
          }
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />

        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            {t('typeDeleteToConfirm') || 'Type "מחק" or "delete" to confirm'}
          </label>
          <Input
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={t('מחק') || "מחק / delete"}
            autoFocus
          />
        </div>
      </div>
    </Modal>
  );
};

export default BulkDeleteConfirmationModal;

