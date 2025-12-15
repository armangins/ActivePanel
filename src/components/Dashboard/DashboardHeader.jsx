import { useLanguage } from '../../contexts/LanguageContext';

/**
 * DashboardHeader Component
 * 
 * Displays the dashboard header with title and welcome message.
 * 
 * @param {Function} t - Translation function
 * @param {boolean} isRTL - Whether the layout is right-to-left
 */
import { Typography } from 'antd';
const { Title, Text } = Typography;

const DashboardHeader = ({ t, isRTL }) => {
  return (
    <div style={{ textAlign: 'right' }} data-onboarding="dashboard-header">
      <Title level={1} style={{ marginBottom: 8 }}>{t('dashboard')}</Title>
      <Text type="secondary">{t('welcome')}</Text>
    </div>
  );
};

export default DashboardHeader;














