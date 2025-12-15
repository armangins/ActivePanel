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

          {selectedAttributeIds.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              paddingTop: '16px', 
              borderTop: '1px solid #f0f0f0'
            }}>
              {selectedAttributeIds.map(attributeId => {
                const attribute = attributes.find(attr => attr.id === attributeId);
                if (!attribute) return null;

                const terms = attributeTerms[attributeId];
                const error = attributeErrors?.[attributeId];
                const isLoadingTerms = terms === undefined && !error;

                return (
                  <div 
                    key={attributeId} 
                    style={{ 
                      paddingBottom: '16px', 
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    <Text strong style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      marginBottom: '12px',
                      textAlign: 'right'
                    }}>
                      {attribute.name}
                    </Text>
                    {error ? (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: '#ff4d4f',
                        fontSize: '14px'
                      }}>
                        <Text type="danger">{t('failedToLoadTerms') || 'שגיאה בטעינת ערכים'}</Text>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => onRetryLoadTerms?.(attributeId)}
                          style={{ padding: 0, height: 'auto' }}
                        >
                          {t('retry') || 'נסה שוב'}
                        </Button>
                      </div>
                    ) : isLoadingTerms ? (
                      <div style={{ textAlign: 'right', padding: '8px 0' }}>
                        <Spin size="small" />
                        <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                          {t('loading') || 'טוען...'}
                        </Text>
                      </div>
                    ) : !terms || terms.length === 0 ? (
                      <Text type="secondary" style={{ fontSize: '12px', textAlign: 'right', display: 'block' }}>
                        {t('noTermsAvailable') || 'אין אפשרויות זמינות לתכונה זו'}
                      </Text>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {terms.map(term => {
                          const isSelected = isTermSelected?.(attributeId, term.id);
                          const isColorAttribute = ['color', 'colour', 'צבע', 'colors', 'colours']
                            .some(keyword => attribute.name.toLowerCase().includes(keyword));

                          if (isColorAttribute) {
                            const colorValue = term.slug;
                            return (
                              <button
                                key={term.id}
                                type="button"
                                onClick={() => onToggleTerm?.(attributeId, term.id)}
                                title={term.name}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  border: `2px solid ${isSelected ? '#1890ff' : '#d9d9d9'}`,
                                  backgroundColor: colorValue,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s',
                                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                  boxShadow: isSelected ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none'
                                }}
                              >
                                {isSelected && (
                                  <span style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '50%',
                                    padding: '2px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                  }}>
                                    <X style={{ fontSize: '12px', color: '#1890ff' }} />
                                  </span>
                                )}
                              </button>
                            );
                          }

                          return (
                            <Tag
                              key={term.id}
                              closable={isSelected}
                              onClose={(e) => {
                                e.preventDefault();
                                onToggleTerm?.(attributeId, term.id);
                              }}
                              color={isSelected ? 'blue' : 'default'}
                              style={{ 
                                cursor: 'pointer',
                                padding: '4px 12px',
                                fontSize: '14px',
                                borderRadius: '6px'
                              }}
                              onClick={() => !isSelected && onToggleTerm?.(attributeId, term.id)}
                            >
                              {term.name}
                            </Tag>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {hasSelectedAttributes && hasSelectedTerms && onAddVariationClick && (
            <div style={{ 
              paddingTop: '16px', 
              borderTop: '1px solid #f0f0f0'
            }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAddVariationClick}
                block
                size="large"
              >
                {t('addVariation') || 'צור וריאציה'}
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
