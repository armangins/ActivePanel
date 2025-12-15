import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import { format } from 'date-fns';
import { he as heLocale } from 'date-fns/locale';
import { DownOutlined as ChevronDown } from '@ant-design/icons';
import { calculatePercentageChange } from '../../shared/utils';

/**
 * EarningsWidget Component
 * 
 * Displays earnings overview with KPIs (First Half, Top Gross, Second Half) 
 * and monthly earnings bar chart.
 * 
 * @param {Array} orders - Array of order objects from WooCommerce API
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Function} t - Translation function
 * @param {boolean} isRTL - Whether the layout is right-to-left
 */
const EarningsWidget = ({ orders, formatCurrency, t, isRTL, onBarClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dateLocale = heLocale;

  // Calculate monthly earnings from orders
  const calculateMonthlyEarnings = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthlyData = {};

    // Initialize all 12 months with zero values
    for (let month = 0; month < 12; month++) {
      const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = {
        month: month + 1,
        monthName: format(new Date(currentYear, month, 1), 'MMM', { locale: dateLocale }),
        earnings: 0,
      };
    }

    // Process orders and aggregate by month - ONLY completed orders
    (orders || []).forEach(order => {
      if (order.status !== 'completed') return;

      const orderDate = new Date(order.date_created);
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth() + 1;

      // Only process orders from current year
      if (orderYear === currentYear) {
        const monthKey = `${orderYear}-${String(orderMonth).padStart(2, '0')}`;

        if (monthlyData[monthKey]) {
          monthlyData[monthKey].earnings += parseFloat(order.total || 0);
        }
      }
    });

    // Convert to array and sort by month
    return Object.values(monthlyData).sort((a, b) => a.month - b.month);
  };

  const monthlyData = calculateMonthlyEarnings();

  // Calculate KPIs
  const firstHalfEarnings = monthlyData.slice(0, 6).reduce((sum, m) => sum + m.earnings, 0);
  const secondHalfEarnings = monthlyData.slice(6, 12).reduce((sum, m) => sum + m.earnings, 0);

  // Find top gross month
  const topGrossMonth = monthlyData.reduce((max, m) =>
    m.earnings > max.earnings ? m : max,
    { earnings: 0, monthName: '', month: 0 }
  );

  // Calculate previous period for comparison
  const calculatePreviousPeriod = (startMonth, endMonth) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let total = 0;

    (orders || []).forEach(order => {
      if (order.status !== 'completed') return;
      const orderDate = new Date(order.date_created);
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth() + 1;

      // Check if order is from previous year's same period
      if (orderYear === currentYear - 1 && orderMonth >= startMonth && orderMonth <= endMonth) {
        total += parseFloat(order.total || 0);
      }
    });

    return total;
  };

  const previousFirstHalf = calculatePreviousPeriod(1, 6);
  const previousSecondHalf = calculatePreviousPeriod(7, 12);

  // Calculate previous year's same month for top gross comparison
  const calculatePreviousMonth = (month) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let total = 0;

    (orders || []).forEach(order => {
      if (order.status !== 'completed') return;
      const orderDate = new Date(order.date_created);
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth() + 1;

      if (orderYear === currentYear - 1 && orderMonth === month) {
        total += parseFloat(order.total || 0);
      }
    });

    return total;
  };

  const previousTopGross = calculatePreviousMonth(topGrossMonth.month);

  // Use shared utility for percentage calculation
  const calculateChange = (current, previous) => calculatePercentageChange(current, previous);

  const firstHalfChange = calculateChange(firstHalfEarnings, previousFirstHalf);
  const secondHalfChange = calculateChange(secondHalfEarnings, previousSecondHalf);
  const topGrossChange = calculateChange(topGrossMonth.earnings, previousTopGross);

  // Highlight the top grossing month
  const highlightMonth = topGrossMonth.month;

  // Custom tooltip formatter
  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            {payload[0]?.payload?.monthName}
          </p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {t('earnings') || 'Earnings'}: {formatCurrency ? formatCurrency(payload[0].value) : `$${payload[0].value.toFixed(2)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Format KPI value
  const formatKPIValue = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}k`;
    }
    return value.toFixed(2);
  };

  return (
    <div className="card">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('earnings') || 'Earnings'}
        </h2>
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {t('viewAll') || 'View All'}
            <ChevronDown className={`w-4 h-4 ${showDropdown ? 'rotate-180' : ''}`} />
          </Button>
          {showDropdown && (
            <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10`}>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDropdown(false);
                  // Navigate to orders page or show detailed earnings
                }}
                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors justify-start"
              >
                {t('viewAllEarnings') || 'View All Earnings'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className={`grid grid-cols-3 gap-4 mb-6 ${isRTL ? '' : ''}`}>
        {/* First Half */}
        <div className={`flex items-baseline gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-2 h-2 rounded-full bg-purple-300 mt-1.5 flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">{t('firstHalf') || 'First Half'}</p>
            <div className={`flex items-baseline gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency ? formatCurrency(firstHalfEarnings) : `$${formatKPIValue(firstHalfEarnings)}`}
              </p>
              {firstHalfChange && (
                <span className={`text-xs font-medium ${firstHalfChange.startsWith('+') ? 'text-green-600' : 'text-orange-600'}`}>
                  {firstHalfChange}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top Gross */}
        <div className={`flex items-baseline gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">{t('topGross') || 'Top Gross'}</p>
            <div className={`flex items-baseline gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency ? formatCurrency(topGrossMonth.earnings) : `$${formatKPIValue(topGrossMonth.earnings)}`}
              </p>
              {topGrossChange && (
                <span className={`text-xs font-medium ${topGrossChange.startsWith('+') ? 'text-green-600' : 'text-orange-600'}`}>
                  {topGrossChange}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Second Half */}
        <div className={`flex items-baseline gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">{t('secondHalf') || 'Second Half'}</p>
            <div className={`flex items-baseline gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency ? formatCurrency(secondHalfEarnings) : `$${formatKPIValue(secondHalfEarnings)}`}
              </p>
              {secondHalfChange && (
                <span className={`text-xs font-medium ${secondHalfChange.startsWith('+') ? 'text-green-600' : 'text-orange-600'}`}>
                  {secondHalfChange}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload.length > 0 && onBarClick) {
                const clickedData = data.activePayload[0].payload;
                onBarClick(clickedData);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="monthName"
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              angle={0}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip content={customTooltip} />
            <Bar
              dataKey="earnings"
              name={t('earnings') || 'Earnings'}
              radius={[4, 4, 0, 0]}
              fill="#a78bfa"
            >
              {monthlyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.month === highlightMonth ? '#7c3aed' : '#a78bfa'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EarningsWidget;

