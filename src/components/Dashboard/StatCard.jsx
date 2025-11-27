import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatCard Component
 * 
 * Displays a single statistic card with title, value, change percentage, and icon.
 * 
 * @param {string} title - The title of the statistic
 * @param {string|number} value - The value to display
 * @param {string} change - Optional change percentage (e.g., "+12.5%")
 * @param {React.Component} icon - Icon component from lucide-react
 * @param {string} trend - Trend direction: 'up' or 'down'
 * @param {boolean} isRTL - Whether the layout is right-to-left
 */
const StatCard = ({ title, value, change, icon: Icon, trend, isRTL }) => {
  const isPositive = trend === 'up';
  
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className={`flex items-center ${'flex-row-reverse'} justify-between`}>
        <div className="flex-1">
          <p className={`text-sm text-gray-600 mb-1 ${'text-right'}`}>{title}</p>
          <p className={`text-2xl font-bold text-gray-900 ${'text-right'}`}>{value}</p>
          {change && (
            <div className={`flex items-center ${'flex-row-reverse'} mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className={'mr-1'}>{change}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary-50 rounded-lg flex-shrink-0">
          <Icon className="text-primary-500" size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;


