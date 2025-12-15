import { useState, useEffect } from 'react';
import { Modal, Button, Input, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { secureLog } from '../../../utils/logger';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, productName, t }) => {
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
            secureLog.error('Delete failed', error);
            setIsDeleting(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            title={t('deleteProduct') || 'Delete Product'}
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
                    {t('delete') || 'Delete'}
                </Button>
            ]}
            width={520}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Alert
                    message={t('warning') || 'Warning'}
                    description={
                        <div>
                            <p>{t('deleteConfirmationMessage')}</p>
                            <p style={{ marginTop: 8, fontWeight: 500 }}>{t('cannotUndo')}</p>
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

export default DeleteConfirmationModal;
