import { ArrowTrendingUpIcon as TrendingUp, ArrowTrendingDownIcon as TrendingDown } from '@heroicons/react/24/outline';
import Card from './Card';

/**
 * StatCard Component
 * 
 * Reusable statistic card component with icon, value, and trend indicator.
 * 
 * @param {string} title - Card title
 * @param {string|number} value - Value to display
 * @param {string} change - Optional change percentage (e.g., "+12.5%")
 * @param {React.Component} icon - Icon component from heroicons
 * @param {string} trend - Trend direction: 'up' or 'down'
 * @param {boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} onClick - Optional click handler
 * @param {string} iconBgColor - Background color for the icon (default: '#21C55E')
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
    <Card onClick={onClick} hover={!!onClick}>
      <div className="p-6">
        {/* Top Section: Trend on left, Title in middle, Icon on right */}
        <div className={`flex items-center justify-between mb-4 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Left: Trend Indicator */}
          {change && (
            <div className="flex-shrink-0">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} ${
                isPositive ? 'text-green-600' : 'text-orange-600'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span className={`text-sm font-medium ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {change}
                </span>
              </div>
            </div>
          )}
          
          {/* Middle: Title */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
              {title}
            </p>
          </div>
          
          {/* Right: Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: iconBgColor }}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        {/* Value */}
        <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-3xl font-regular text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
