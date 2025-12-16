import { memo } from 'react';
import { InboxOutlined as Package } from '@ant-design/icons';
import { Typography, Card, Flex, theme, Space } from 'antd';
import { OptimizedImage } from '../../ui';

const { Text } = Typography;

const VariationCard = memo(({
  variation,
  formatCurrency,
  isRTL,
  t
}) => {
  const { token } = theme.useToken();

  // Direct property access is faster than useMemo for simple values
  const imageUrl = variation.image?.src || null;
  // Use only regular_price - do not use 'price' field as it may include tax calculations
  const regularPrice = variation.regular_price || null;
  const salePrice = variation.sale_price || null;

  const displayPrice = regularPrice ? formatCurrency(parseFloat(regularPrice)) : '-';
  const displaySalePrice = salePrice ? formatCurrency(parseFloat(salePrice)) : null;

  const stockStatus = variation.stock_status || 'instock';

  // Get variation attributes (e.g., "Size: Large, Color: Red")
  const attributesText = variation.attributes?.length > 0
    ? variation.attributes.map(attr => `${attr.name}: ${attr.option}`).join(', ')
    : '';

  // Get variation name (use attributes text or variation name)
  const variationName = attributesText || variation.name || `Variation #${variation.id}`;

  return (
    <Card
      hoverable
      styles={{ body: { padding: 0, height: '100%' } }}
      style={{
        height: '100%',
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        overflow: 'hidden'
      }}
    >
      <Flex vertical style={{ height: '100%' }}>
        {/* Variation Image */}
        <Flex
          align="center"
          justify="center"
          style={{
            width: '100%',
            aspectRatio: '1/1',
            backgroundColor: token.colorFillQuaternary,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            position: 'relative'
          }}
        >
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl}
              alt={variationName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Package style={{ fontSize: 24, color: token.colorTextQuaternary }} />
          )}
        </Flex>

        {/* Variation Info */}
        <Flex vertical flex={1} style={{ padding: 12, minHeight: 0 }}>
          {/* Variation Name */}
          <div style={{ marginBottom: 4, textAlign: 'right' }}>
            <Text strong ellipsis={{ tooltip: variationName }} style={{ fontSize: 13 }}>
              {variationName}
            </Text>
          </div>

          {/* SKU */}
          {variation.sku && (
            <div style={{ marginBottom: 4, textAlign: 'right' }}>
              <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                <Text strong style={{ fontSize: 12 }}>{t('sku')}:</Text> {variation.sku}
              </Text>
            </div>
          )}

          {/* Price */}
          <div style={{ marginBottom: 4 }}>
            <Flex align="center" justify="start" gap={4}>
              {displaySalePrice ? (
                <>
                  <Text style={{ color: token.colorError, fontSize: 14 }}>{displaySalePrice}</Text>
                  {regularPrice && (
                    <Text delete type="secondary" style={{ fontSize: 12 }}>{displayPrice}</Text>
                  )}
                </>
              ) : (
                <Text style={{ fontSize: 14 }}>{displayPrice}</Text>
              )}
            </Flex>
          </div>

          {/* Stock */}
          <Flex
            align="center"
            justify="start"
            gap={6}
            style={{
              marginTop: 'auto',
              paddingTop: 8,
              borderTop: `1px solid ${token.colorBorderSecondary}`
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('stock')}: <Text strong>{variation.stock_quantity ?? '-'}</Text>
            </Text>
            <div
              title={stockStatus === 'instock' ? t('inStock') : t('outOfStock')}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: stockStatus === 'instock' ? token.colorSuccess : token.colorWarning,
                flexShrink: 0
              }}
            />
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
});

VariationCard.displayName = 'VariationCard';

export default VariationCard;

