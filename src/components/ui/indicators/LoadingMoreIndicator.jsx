import { Spin } from 'antd';

/**
 * LoadingMoreIndicator Component - Ant Design wrapper
 * 
 * Reusable loading indicator for pagination/infinite scroll using Ant Design Spin.
 */
const LoadingMoreIndicator = ({ isRTL = true, message }) => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '32px 0',
      textAlign: isRTL ? 'right' : 'left'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Spin size="small" />
        <span style={{ fontSize: 14, color: '#666' }}>{message || 'Loading...'}</span>
      </div>
    </div>
  );
};

export default LoadingMoreIndicator;
