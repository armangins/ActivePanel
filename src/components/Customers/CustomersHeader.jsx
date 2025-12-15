/**
 * CustomersHeader Component
 * 
 * Header section for the Customers page displaying title and customer count.
 * 
 * @param {Number} displayedCount - Number of customers currently displayed
 * @param {Number} totalCount - Total number of customers
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
import { Typography } from 'antd';
const { Title, Text } = Typography;

const CustomersHeader = ({ displayedCount, totalCount, isRTL, t }) => {
  return (
    <div style={{ textAlign: 'right' }}>
      <Title level={1} style={{ marginBottom: 8 }}>{t('customers')}</Title>
      <Text type="secondary">
        {t('showing')} {displayedCount} {t('of')} {totalCount} {t('customers').toLowerCase()}
      </Text>
    </div>
  );
};

export default CustomersHeader;














