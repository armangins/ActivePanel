import { Spin } from 'antd';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * LoadingState Component - Ant Design wrapper
 * 
 * Reusable loading indicator component using Ant Design Spin.
 */
const LoadingState = ({ message, size = 'md', fullHeight = false }) => {
  const { t } = useLanguage();

  const sizeMap = {
    sm: 'small',
    md: 'default',
    lg: 'large',
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullHeight ? { height: '100vh' } : { minHeight: '100vh' }),
  };

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center' }}>
        <Spin size={sizeMap[size] || 'default'} />
        {message && (
          <p style={{ marginTop: 16, color: '#666' }}>
            {message || t('loading')}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
