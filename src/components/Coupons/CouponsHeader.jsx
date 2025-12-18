import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import { Row, Col, Typography, Input } from 'antd';
const { Title, Text } = Typography;

/**
 * CouponsHeader Component
 * 
 * Header section for the Coupons page.
 * Displays title, coupon count, create button, and search.
 * 
 * @param {Number} totalCount - Total number of coupons
 * @param {Number} displayedCount - Number of coupons currently displayed
 * @param {Function} onCreateCoupon - Callback when create button is clicked
 * @param {String} searchQuery - Current search query
 * @param {Function} onSearchChange - Callback when search query changes
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const CouponsHeader = ({
  totalCount,
  displayedCount,
  onCreateCoupon,
  searchQuery,
  onSearchChange,
  isRTL,
  t,
}) => {
  return (
    <Row gutter={[16, 16]} justify="space-between" align="middle">
      <Col xs={24} md={12}>
        <div style={{ textAlign: 'right' }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            {t('coupons') || 'Coupons'}
          </Title>
          <Text type="secondary">
            {t('displayingCoupons') || 'Displaying'} {displayedCount} {t('of') || 'of'} {totalCount} {t('coupons') || 'coupons'}
          </Text>
        </div>
      </Col>

      <Col xs={24} md={12}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexDirection: isRTL ? 'column-reverse' : 'column' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchCoupons') || 'Search coupons by code or description...'}
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            allowClear
          />
          <Button
            onClick={onCreateCoupon}
            variant="primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexDirection: isRTL ? 'row-reverse' : 'row' }}
          >
            <PlusOutlined />
            <span>{t('createCoupon') || 'Create Coupon'}</span>
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default CouponsHeader;
