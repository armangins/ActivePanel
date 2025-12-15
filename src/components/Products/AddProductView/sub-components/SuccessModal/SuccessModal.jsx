import { memo } from 'react';
import { Modal, Result, Button } from 'antd';
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
 * @param {string} productName - Name of the product
 */
const SuccessModal = ({
  isOpen,
  onClose,
  onCreateAnother,
  onGoToProducts,
  action = 'create',
  productName = ''
}) => {
  const { t } = useLanguage();

  const handleCreateAnother = () => {
    onCreateAnother?.();
  };

  const handleGoToProducts = () => {
    onGoToProducts?.();
  };

  // Determine message based on action and product name
  const title = action === 'update'
    ? (t('productUpdatedSuccessfully') || `המוצר ${productName} עודכן בהצלחה!`)
    : `The product ${productName} was successfully added`; // Keeping user's requested specific text structure

  // If specific Hebrew text is preferred for 'create' matching the English structure:
  // "המוצר ${productName} נוסף בהצלחה"

  // Note: user explicitly asked for "the product [name] was sucessfuly added", 
  // so we prioritize that structure in the logic or fallback. 
  // However, since the app is RTL/Hebrew, I will provide a Hebrew fallback that matches the pattern if 't' returns nothing.
  const displayTitle = action === 'update'
    ? (t('productUpdatedSuccessfully') || `המוצר ${productName} עודכן בהצלחה`)
    : (productName ? `המוצר ${productName} נוסף בהצלחה` : (t('productCreatedSuccessfully') || 'המוצר נוסף בהצלחה'));

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      closable={false}
      maskClosable={false}
      width={600}
    >
      <Result
        status="success"
        title={displayTitle}
        subTitle={t('wouldYouLikeToCreateAnother') || 'האם תרצה להוסיף מוצר נוסף?'}
        extra={[
          <Button type="primary" key="console" onClick={handleCreateAnother} size="large">
            {t('createAnotherProduct') || 'כן, הוסף מוצר נוסף'}
          </Button>,
          <Button key="buy" onClick={handleGoToProducts} size="large">
            {t('goToProducts') || 'עבור לעמוד המוצרים'}
          </Button>,
        ]}
      />
    </Modal>
  );
};

export default memo(SuccessModal);
