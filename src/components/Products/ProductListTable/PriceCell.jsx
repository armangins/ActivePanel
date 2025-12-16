import { Typography, theme } from 'antd';
import { calculateVariationPriceRange, formatPriceRange, getRegularPrice, hasSalePrice } from './utils/priceHelpers';

const { Text } = Typography;

/**
 * PriceCell Component
 */
const PriceCell = ({ product, formatCurrency }) => {
  const { token } = theme.useToken();
  const isVariable = product.type === 'variable';

  const cellStyle = {
    padding: '12px 16px',
    textAlign: 'right', // Ant Design usually left aligns, but this was explicitly right aligned
    borderBottom: `1px solid ${token.colorBorderSecondary}`
  };

  // For variable products, calculate price range from variations
  if (isVariable && product.variations) {
    const priceRange = calculateVariationPriceRange(product.variations);

    if (priceRange) {
      return (
        <td style={cellStyle}>
          <Text strong style={{ fontSize: 14 }}>
            {formatPriceRange(priceRange.minPrice, priceRange.maxPrice, formatCurrency)}
          </Text>
        </td>
      );
    }
  }

  // Simple product pricing
  // Use only regular_price - do not use 'price' field as it may include tax calculations
  const regularPriceValue = getRegularPrice(product);
  const hasSale = hasSalePrice(product);

  return (
    <td style={cellStyle}>
      <Text
        strong={!hasSale}
        delete={hasSale}
        type={hasSale ? 'secondary' : undefined}
        style={{ fontSize: 14 }}
      >
        {formatCurrency(regularPriceValue)}
      </Text>
    </td>
  );
};

export default PriceCell;

