import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { CloseOutlined as X, PlusOutlined } from '@ant-design/icons';
import { Spin, Tag, Typography } from 'antd';
import { Card, Button } from '../../../../ui';
import { useLanguage } from '../../../../../contexts/LanguageContext';

const { Text, Title } = Typography;

/**
 * AttributesSection Component
 * 
 * @param {Array} attributes - All available attributes
 * @param {Object} attributeTerms - Terms for each attribute: { attributeId: [terms] }
 * @param {Array} selectedAttributeIds - IDs of selected attributes
 * @param {Object} selectedAttributeTerms - Selected terms: { attributeId: [termIds] }
 * @param {boolean} loading - Whether attributes are being loaded
 * @param {function} onToggleAttribute - Callback when attribute is toggled (receives attributeId)
 * @param {function} onToggleTerm - Callback when term is toggled (receives attributeId, termId)
 * @param {function} isAttributeSelected - Function to check if attribute is selected
 * @param {function} isTermSelected - Function to check if term is selected
 */

const AttributesSection = ({
  attributes = [],
  attributeTerms = {},
  selectedAttributeIds = [],
  selectedAttributeTerms = {},
  loading = false,
  onToggleAttribute,
  onToggleTerm,
  isAttributeSelected,
  isTermSelected,
  attributeErrors,
  onRetryLoadTerms,
  onAddVariationClick, // New prop for creating variations
  onGenerateVariations, // New prop for generating all variations
}) => {
  const { t } = useLanguage();
  const { formState: { errors } } = useFormContext();

  const hasSelectedAttributes = selectedAttributeIds.length > 0;
  const hasSelectedTerms = selectedAttributeIds.some(
    attrId => selectedAttributeTerms[attrId]?.length > 0
  );

  return (
    <Card style={{
      padding: '24px',
      border: errors.attributes ? '1px solid #ff4d4f' : undefined
    }}>
      <Title level={4} style={{
        marginBottom: '16px',
        textAlign: 'right',
        fontSize: '18px',
        fontWeight: 600
      }}>
        {t('attributes') || 'תכונות'}
      </Title>

      {loading ? (
        <div style={{ textAlign: 'right', padding: '16px 0' }}>
          <Spin size="small" />
          <Text type="secondary" style={{ marginLeft: '8px', fontSize: '14px' }}>
            {t('loading') || 'טוען...'}
          </Text>
        </div>
      ) : attributes.length === 0 ? (
        <Text type="secondary" style={{ fontSize: '14px', textAlign: 'right', display: 'block' }}>
          {t('noAttributes') || 'אין תכונות זמינות'}
        </Text>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <Text strong style={{
              display: 'block',
              fontSize: '14px',
              marginBottom: '12px',
              textAlign: 'right'
            }}>
              {t('selectAttributes') || 'בחר תכונות למוצר'}
            </Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {attributes.map(attribute => {
                const isSelected = isAttributeSelected?.(attribute.id);
                return (
                  <Tag
                    key={attribute.id}
                    closable={isSelected}
                    onClose={(e) => {
                      e.preventDefault();
                      onToggleAttribute?.(attribute.id);
                    }}
                    color={isSelected ? 'blue' : 'default'}
                    style={{
                      cursor: 'pointer',
                      padding: '4px 12px',
                      fontSize: '14px',
                      borderRadius: '6px'
                    }}
                    onClick={() => !isSelected && onToggleAttribute?.(attribute.id)}
                  >
                    {attribute.name}
                  </Tag>
                );
              })}
            </div>
          </div>

          {hasSelectedAttributes && onAddVariationClick && (
            <div style={{
              paddingTop: '16px',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              gap: '12px',
              flexDirection: 'row'
            }}>
              {onGenerateVariations && (
                <Button
                  variant="secondary"
                  icon={<div style={{ marginRight: '8px' }}>✨</div>}
                  onClick={onGenerateVariations}
                  size="lg"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(to right, #e6f7ff, #bae7ff)',
                    borderColor: '#1890ff',
                    color: '#096dd9'
                  }}
                >
                  {t('generateVariations') || 'צור את כל הוריאציות'}
                </Button>
              )}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={onAddVariationClick}
                size="lg"
                style={{ flex: 1 }}
              >
                {t('addVariation') || 'הוסף וריאציה ידנית'}
              </Button>
            </div>
          )}
        </div>
      )}

      {errors.attributes && (
        <Text type="danger" style={{
          marginTop: '8px',
          fontSize: '14px',
          textAlign: 'right',
          display: 'block'
        }}>
          {errors.attributes.message}
        </Text>
      )}
    </Card>
  );
};

export default memo(AttributesSection);
