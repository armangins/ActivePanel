import { Empty } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import React from 'react';

/**
 * EmptyState Component - Ant Design wrapper
 * 
 * Reusable empty state display component using Ant Design Empty.
 */
const EmptyState = ({
  message,
  description,
  icon: Icon,
  action,
  isRTL = true
}) => {
  const iconElement = Icon ? (React.isValidElement(Icon) ? Icon : <Icon />) : <InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />;
  
  return (
    <Empty
      image={iconElement}
      styles={{ image: { height: 64 } }}
      description={
        <>
          {message && <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{message}</div>}
          {description && <div style={{ fontSize: 14, color: '#8c8c8c' }}>{description}</div>}
        </>
      }
    >
      {action}
    </Empty>
  );
};

export default EmptyState;
