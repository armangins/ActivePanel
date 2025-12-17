import { Descriptions, Tag, Typography, theme } from 'antd';

const { Text, Title } = Typography;

/**
 * ProductDetailsBasicInfo Component
 */
const ProductDetailsBasicInfo = ({ product, isRTL, t }) => {
  const { token } = theme.useToken();

  return (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>פרטי מוצר</Title>
      <Descriptions column={3} layout="vertical" size="small">
        <Descriptions.Item label={t('productName')}>
          <Text strong>{product.name || '-'}</Text>
        </Descriptions.Item>

        <Descriptions.Item label={t('sku')}>
          <Text copyable={!!product.sku}>{product.sku || '-'}</Text>
        </Descriptions.Item>

        <Descriptions.Item label={t('category')}>
          {product.categories && product.categories.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {product.categories.map((cat) => (
                <Tag key={cat.id} bordered={false} style={{ margin: 0 }}>
                  {cat.name}
                </Tag>
              ))}
            </div>
          ) : (
            <Text type="secondary">-</Text>
          )}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default ProductDetailsBasicInfo;

