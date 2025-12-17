import { Typography, theme } from 'antd';
import { hasSalePrice, getSalePrice } from './utils/priceHelpers';

const { Text } = Typography;

/**
 * SalePriceCell Component
 */
const SalePriceCell = ({ product, formatCurrency }) => {
  const { token } = theme.useToken();

  const cellStyle = {
    padding: '12px 16px',
    textAlign: 'right',
    borderBottom: `1px solid ${token.colorBorderSecondary}`
  };

  // Variable products show price range in PriceCell, so hide sale price
  if (product.type === 'variable') {
    return (
      <td style={cellStyle}>
        <Text type="secondary" style={{ fontSize: 14 }}>-</Text>
      </td>
    );
  }

  const salePriceValue = getSalePrice(product);

  return (
    <td style={cellStyle}>
      {salePriceValue ? (
        <Text strong style={{ fontSize: 14 }}>
          {formatCurrency(salePriceValue)}
        </Text>
      ) : (
        <Text type="secondary" style={{ fontSize: 14 }}>-</Text>
      )}
    </td>
  );
};

export default SalePriceCell;











