import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

/**
 * StatCard Component - Ant Design wrapper
 * 
 * Reusable statistic card component using Ant Design Card and Statistic.
 */
const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend, 
  isRTL = true, 
  onClick,
  iconBgColor = '#21C55E'
}) => {
  const isPositive = trend === 'up';
  
  return (
    <Card 
      hoverable={!!onClick}
      onClick={onClick}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div style={{ padding: 0 }}>
        {/* Top Section: Trend, Title, Icon */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: 16,
          gap: 16,
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }}>
          {/* Trend Indicator */}
          {change && (
            <div style={{ flexShrink: 0 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                flexDirection: isRTL ? 'row-reverse' : 'row',
                color: isPositive ? '#52c41a' : '#ff4d4f',
                gap: 4
              }}>
                {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                <span style={{ fontSize: 14, fontWeight: 500 }}>{change}</span>
              </div>
            </div>
          )}
          
          {/* Title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ 
              fontSize: 14, 
              fontWeight: 700, 
              color: '#666',
              textAlign: isRTL ? 'right' : 'left',
              margin: 0
            }}>
              {title}
            </p>
          </div>
          
          {/* Icon */}
          {Icon && (
            <div style={{ 
              width: 48, 
              height: 48, 
              borderRadius: 12, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: iconBgColor,
              flexShrink: 0
            }}>
              {React.isValidElement(Icon) ? Icon : <Icon style={{ fontSize: 24, color: '#fff' }} />}
            </div>
          )}
        </div>
        
        {/* Value */}
        <Statistic
          value={value}
          valueStyle={{ 
            fontSize: 30, 
            fontWeight: 400,
            textAlign: isRTL ? 'right' : 'left'
          }}
        />
      </div>
    </Card>
  );
};

export default StatCard;
