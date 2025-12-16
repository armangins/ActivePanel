
import { Descriptions, Tag, Typography, theme } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

const { Text, Title } = Typography;

/**
 * ProductDetailsPricing Component
 */
const ProductDetailsPricing = ({ product, formatCurrency, isRTL, t }) => {
  const stockStatus = product.stock_status || 'instock';
  const regularPrice = product.regular_price || null;
  const salePrice = product.sale_price || null;

  return (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>{t('pricing') || 'Pricing'}</Title>

      <Descriptions column={1} layout="vertical" size="small">
        <Descriptions.Item label={t('price')}>
          <Text strong>{regularPrice ? formatCurrency(parseFloat(regularPrice)) : '-'}</Text>
        </Descriptions.Item>

        <Descriptions.Item label={t('salePrice')}>
          <Text type={salePrice ? 'success' : 'secondary'}>
            {salePrice ? formatCurrency(parseFloat(salePrice)) : '-'}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label={t('status')}>
          {stockStatus === 'instock' ? (
            <Tag icon={<CheckCircleFilled />} color="success">
              {t('inStock')}
            </Tag>
          ) : (
            <Tag icon={<CloseCircleFilled />} color="error">
              {t('outOfStock')}
            </Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label={t('stockQuantity')}>
          <Text>{product.stock_quantity ?? '-'}</Text>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default ProductDetailsPricing;

