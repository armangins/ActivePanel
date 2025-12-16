import { Collapse, Badge, theme, Typography } from 'antd';
import { VariationsList } from '../../Variations';

const { Text } = Typography;

/**
 * ProductDetailsOrganization Component
 */
const ProductDetailsOrganization = ({
  product,
  isRTL,
  t,
  formatCurrency,
  variations = [],
  loadingVariations = false,
  variationsError = null
}) => {
  const { token } = theme.useToken();
  const variationsCount = variations?.length || 0;

  // Only show for variable products
  if (product.type !== 'variable') return null;

  const items = [
    {
      key: '1',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text strong>{t('variations') || 'Variations'}</Text>
          <Badge count={variationsCount} showZero color={token.colorPrimary} />
        </div>
      ),
      children: (
        <VariationsList
          variations={variations}
          loading={loadingVariations}
          error={variationsError}
          formatCurrency={formatCurrency}
          t={t}
          showActions={false}
          emptyMessage={t('noVariations') || 'No variations found'}
        />
      ),
    },
  ];

  return (
    <Collapse items={items} bordered={false} style={{ background: token.colorBgContainer }} />
  );
};

export default ProductDetailsOrganization;
