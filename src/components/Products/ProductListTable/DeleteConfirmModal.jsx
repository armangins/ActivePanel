import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

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
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={t('confirmDelete') || 'Confirm Delete'}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel') || 'Cancel'}
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          {t('yes') || 'Yes'}
        </Button>
      ]}
      width={400}
    >
      <div>
        <p style={{ marginBottom: productName ? 8 : 0 }}>
          {t('deleteProductConfirm') || 'Are you sure you want to delete this product?'}
        </p>
        {productName && (
          <p style={{ fontWeight: 500, color: '#262626' }}>
            {productName}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;


