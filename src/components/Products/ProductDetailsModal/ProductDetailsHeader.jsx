import { Button, Typography, Flex, theme } from 'antd';
import { CloseOutlined, ExportOutlined } from '@ant-design/icons';

const { Title } = Typography;

/**
 * ProductDetailsHeader Component
 * 
 * Header section of the product details modal.
 * Displays the title, "View on Site" button, and close button.
 * 
 * @param {Object} product - Product object
 * @param {Function} onClose - Callback to close the modal
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const ProductDetailsHeader = ({ product, onClose, isRTL, t }) => {
  const { token } = theme.useToken();

  return (
    <div style={{
      padding: '16px 24px',
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      <Flex justify="space-between" align="center" style={{ flexDirection: isRTL ? 'row' : 'row-reverse' }}>
        <Flex gap="small" align="center" style={{ flexDirection: isRTL ? 'row' : 'row-reverse' }}>
          <Button
            onClick={onClose}
            type="text"
            icon={<CloseOutlined />}
            aria-label={t('close')}
          />
          <Title level={4} style={{ margin: 0 }}>
            {t('productDetails') || t('products')}
          </Title>
        </Flex>

        <div style={{ display: 'flex', gap: 12 }}>
          {product.permalink && (
            <Button
              type="default"
              icon={<ExportOutlined />}
              onClick={() => window.open(product.permalink, '_blank')}
            >
              {t('viewOnSite')}
            </Button>
          )}
        </div>
      </Flex>
    </div>
  );
};

export default ProductDetailsHeader;

