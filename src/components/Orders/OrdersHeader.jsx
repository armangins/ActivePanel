/**
 * OrdersHeader Component
 * 
 * Header section for the Orders page displaying title and order count.
 * 
 * @param {Number} displayedCount - Number of orders currently displayed
 * @param {Number} totalCount - Total number of orders
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
import { Typography } from 'antd';
const { Title, Text } = Typography;

const OrdersHeader = ({ displayedCount, totalCount, isRTL, t }) => {
  return (
    <div style={{ textAlign: 'right' }}>
      <Title level={1} style={{ marginBottom: 8 }}>{t('orders')}</Title>
      <Text type="secondary">
        {t('showing')} {displayedCount} {t('of')} {totalCount} {t('orders').toLowerCase()}
      </Text>
    </div>
  );
};

export default OrdersHeader;















