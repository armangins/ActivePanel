import { memo } from 'react';
import { PlusOutlined as Plus } from '@ant-design/icons';
import { Button, Modal, Typography, Flex } from 'antd';
import VariationForm from '../VariationForm/VariationForm';
import { useLanguage } from '../../../../../contexts/LanguageContext';

const { Text, Title } = Typography;

/**
 * CreateVariationModal Component
 */
const CreateVariationModal = ({
  isOpen,
  onClose,
  formData,
  onFormDataChange,
  selectedAttributeIds,
  attributes,
  attributeTerms,
  creating = false,
  generatingSKU = false,
  onGenerateSKU,
  parentProductName,
  parentSku,
  existingVariationSkus = [],
  onToggleAttribute,
  isAttributeSelected,
  onSubmit,
}) => {
  const { t, isRTL } = useLanguage();

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit?.();
  };

  // Check for SKU duplicates
  const currentSku = (formData.sku || '').trim();
  const hasSkuError = currentSku && (
    (parentSku && currentSku === parentSku.trim()) ||
    existingVariationSkus.some(sku => sku && sku.trim() === currentSku)
  );

  const canSubmit = selectedAttributeIds.length > 0 && !creating && !hasSkuError;

  return (
    <Modal
      open={isOpen}
      onCancel={() => !creating && onClose()}
      title={
        <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <Title level={4} style={{ margin: 0 }}>{t('addVariation') || 'הוסף וריאציה'}</Title>
        </div>
      }
      footer={
        <Flex gap="small" justify="start">
          <Button
            key="cancel"
            onClick={onClose}
            disabled={creating}
          >
            {t('cancel') || 'ביטול'}
          </Button>
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={creating}
            icon={<Plus />}
          >
            {creating ? (t('creating') || 'יוצר...') : (t('createVariation') || 'צור וריאציה')}
          </Button>
        </Flex>
      }
      width={700}
      centered
      maskClosable={!creating}
      closable={!creating}
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
          onToggleAttribute={onToggleAttribute}
          isAttributeSelected={isAttributeSelected}
          disabled={creating}
        />
      </div>
    </Modal>
  );
};

export default memo(CreateVariationModal);

