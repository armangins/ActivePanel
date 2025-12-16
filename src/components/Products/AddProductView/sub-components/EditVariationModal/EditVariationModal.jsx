import { memo } from 'react';
import { SaveOutlined as Save } from '@ant-design/icons';
import { Button, Modal, Typography, Flex } from 'antd';
import VariationForm from '../VariationForm/VariationForm';
import { useLanguage } from '../../../../../contexts/LanguageContext';

const { Title } = Typography;

/**
 * EditVariationModal Component
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
  parentSku,
  existingVariationSkus = [],
  currentVariationId = null,
  onSubmit,
}) => {
  const { t, isRTL } = useLanguage();

  if (!isOpen) return null;

  // Check for SKU duplicates
  const currentSku = (formData.sku || '').trim();
  const hasSkuError = currentSku && (
    (parentSku && currentSku === parentSku.trim()) ||
    existingVariationSkus.some(sku => sku && sku.trim() === currentSku)
  );

  const handleSubmit = () => {
    if (hasSkuError) {
      return; // Prevent submission if SKU is duplicate
    }
    onSubmit?.();
  };

  const canSubmit = !updating && !hasSkuError;

  return (
    <Modal
      open={isOpen}
      onCancel={() => !updating && onClose()}
      title={
        <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <Title level={4} style={{ margin: 0 }}>{t('editVariation') || 'ערוך וריאציה'}</Title>
        </div>
      }
      footer={
        <Flex gap="small" justify="end" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <Button
            key="cancel"
            onClick={onClose}
            disabled={updating}
          >
            {t('cancel') || 'ביטול'}
          </Button>
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={updating}
            icon={<Save />}
          >
            {t('save')}
          </Button>
        </Flex>
      }
      width={700}
      centered
      maskClosable={!updating}
      closable={!updating}
      destroyOnClose
    >
      <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        <VariationForm
          formData={formData}
          onFormDataChange={onFormDataChange}
          selectedAttributeIds={selectedAttributeIds}
          attributes={attributes}
          attributeTerms={attributeTerms}
          generatingSKU={generatingSKU}
          onGenerateSKU={onGenerateSKU}
          parentProductName={parentProductName}
          parentSku={parentSku}
          existingVariationSkus={existingVariationSkus}
          currentVariationId={currentVariationId}
          disabled={updating}
        />
      </div>
    </Modal>
  );
};

export default memo(EditVariationModal);

