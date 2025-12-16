import { InboxOutlined as Package, DownOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import { Button, Typography, theme, Flex } from 'antd';
import { UserAvatar, OptimizedImage } from '../../ui';
import { validateImageUrl, sanitizeProductName, sanitizeAttributeValue } from '../utils/securityHelpers';

const { Text } = Typography;

/**
 * ProductCell Component
 */
const ProductCell = ({ product, isRTL, t, isExpanded, onToggleExpand }) => {
  const { token } = theme.useToken();

  // SECURITY: Validate and sanitize image URL
  const rawImageUrl = product.images && product.images.length > 0 ? product.images[0].src : null;
  const imageUrl = rawImageUrl ? validateImageUrl(rawImageUrl) : null;

  // SECURITY: Sanitize product name to prevent XSS
  const productName = sanitizeProductName(product.name || t('productName'));
  const isVariable = product.type === 'variable';

  // Extract variation details from attributes
  const getVariationDetails = () => {
    if (!product.attributes || !Array.isArray(product.attributes)) {
      return null;
    }

    // Find attributes that are used for variations
    const variationAttributes = product.attributes.filter(attr => attr.variation === true);

    if (variationAttributes.length === 0) {
      return null;
    }

    // Format attributes as "AttributeName : value1 , value2 , value3"
    // SECURITY: Sanitize attribute names and values to prevent XSS
    return variationAttributes.map(attr => {
      const attrName = sanitizeAttributeValue(attr.name || '');
      const options = attr.options || [];
      if (options.length === 0) return null;

      // SECURITY: Sanitize each option value
      const sanitizedOptions = options.map(opt => sanitizeAttributeValue(String(opt)));
      const values = sanitizedOptions.join(' , ');
      return `${attrName} : ${values}`;
    }).filter(Boolean);
  };

  const variationDetails = getVariationDetails();

  return (
    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
      <Flex align="start" gap={12} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        {isVariable && (
          <Button
            type="text"
            size="small"
            shape="circle"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand && onToggleExpand();
            }}
            icon={isExpanded ?
              <DownOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} /> :
              (isRTL ? <LeftOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} /> : <RightOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />)
            }
            title={isExpanded ? t('collapse') || 'Collapse' : t('expand') || 'Expand'}
            style={{ marginTop: 12 }}
          />
        )}

        <div style={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: token.borderRadiusLG,
          overflow: 'hidden',
          backgroundColor: token.colorFillQuaternary,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl}
              alt={productName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              // PERFORMANCE: Resize images for list view (48x48 for table cells)
              resize={true}
              width={48}
              height={48}
            />
          ) : (
            <Package style={{ fontSize: 20, color: token.colorTextQuaternary }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
          <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>{productName}</Text>
          {variationDetails && variationDetails.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {variationDetails.map((detail, index) => (
                <Text key={index} type="secondary" style={{ fontSize: 12, display: 'block' }}>
                  {detail}
                </Text>
              ))}
            </div>
          )}
        </div>
      </Flex>
    </td>
  );
};

export default ProductCell;

