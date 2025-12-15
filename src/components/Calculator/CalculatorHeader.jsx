import { CalculatorOutlined as CalculatorIcon } from '@ant-design/icons';
import { Typography, Space } from 'antd';
import { useLanguage } from '../../contexts/LanguageContext';

const { Title, Text } = Typography;

/**
 * CalculatorHeader Component
 * 
 * Header section for the calculator page
 */
const CalculatorHeader = () => {
  const { t } = useLanguage();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <Title level={2} style={{ margin: 0, textAlign: 'right' }}>
          {t('smartPricingCalculator') || 'מחשבון מחיר חכם'}
        </Title>
        <Text type="secondary" style={{ display: 'block', marginTop: 8, textAlign: 'right' }}>
          {t('pricingCalculatorDesc') || 'קבע מחירי מכירה מדויקים על בסיס עלויות אמיתיות ושולי רווח רצויים'}
        </Text>
      </div>
      <div style={{ 
        backgroundColor: '#e6f4ff', 
        padding: 16, 
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CalculatorIcon style={{ fontSize: 32, color: '#1890ff' }} />
      </div>
    </div>
  );
};

export default CalculatorHeader;

