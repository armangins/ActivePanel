import { Spin, Empty } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import React from 'react';

/**
 * DataPlaceholder Component - Ant Design wrapper
 * 
 * A placeholder component to show when data is loading or on its way.
 */
const DataPlaceholder = ({ 
  message, 
  subMessage,
  icon: Icon,
  showSpinner = false 
}) => {
  const iconElement = Icon ? (React.isValidElement(Icon) ? Icon : <Icon />) : <CloudUploadOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />;
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 32,
      textAlign: 'center',
      direction: 'rtl'
    }}>
      {showSpinner ? (
        <Spin size="large" style={{ marginBottom: 16 }} />
      ) : (
        <div style={{ marginBottom: 16 }}>
          {iconElement}
        </div>
      )}
      
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#666', marginBottom: 8 }}>
        {message || 'הנתונים בדרך'}
      </h3>
      
      {subMessage && (
        <p style={{ fontSize: 14, color: '#8c8c8c', maxWidth: 400 }}>
          {subMessage}
        </p>
      )}
    </div>
  );
};

export default DataPlaceholder;
