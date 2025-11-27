import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import { format } from 'date-fns';
import { he as heLocale } from 'date-fns/locale';

/**
 * MonthlyOrdersChart Component
 * 
 * Displays a bar chart showing the number of orders and total revenue for each month of the current year.
 * Data is based on REAL orders from WooCommerce API.
 * 
 * @param {Array} orders - Array of order objects from WooCommerce API
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Function} t - Translation function
 * @param {boolean} isRTL - Whether the layout is right-to-left
 */
const MonthlyOrdersChart = ({ orders, formatCurrency, t, isRTL }) => {
  const dateLocale = heLocale; // Always Hebrew

  // Calculate monthly data from orders
  const calculateMonthlyData = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthlyData = {};

    // Initialize all 12 months with zero values
    for (let month = 0; month < 12; month++) {
      const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = {
        month: month + 1,
        monthName: format(new Date(currentYear, month, 1), 'MMM', { locale: dateLocale }),
        orders: 0,
        revenue: 0,
      };
    }

    // Process orders and aggregate by month - ONLY completed orders
    orders.forEach(order => {
      // Only count completed orders for revenue
      if (order.status !== 'completed') return;
      
      const orderDate = new Date(order.date_created);
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth() + 1;

      // Only process orders from current year
      if (orderYear === currentYear) {
        const monthKey = `${orderYear}-${String(orderMonth).padStart(2, '0')}`;
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].orders += 1;
          monthlyData[monthKey].revenue += parseFloat(order.total || 0);
        }
      }
    });

    // Convert to array and sort by month
    return Object.values(monthlyData).sort((a, b) => a.month - b.month);
  };

  const chartData = calculateMonthlyData();

  // Custom tooltip formatter
  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            {payload[0]?.payload?.monthName}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'orders' ? t('orders') || 'Orders' : t('revenue') || 'Revenue'}:{' '}
              {entry.name === 'orders' 
                ? entry.value 
                : formatCurrency ? formatCurrency(entry.value) : `$${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="card">
        <h2 className={`text-xl font-semibold text-gray-900 mb-4 ${'text-right'}`}>
          {t('monthlyOrdersChart') || 'Monthly Orders & Revenue'}
        </h2>
        <p className={`text-gray-500 text-center py-8 ${'text-right'}`}>
          {t('noOrdersData') || 'No orders data available'}
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className={`text-xl font-semibold text-gray-900 mb-4 ${'text-right'}`}>
        {t('monthlyOrdersChart') || 'Monthly Orders & Revenue'}
      </h2>
      <div className="w-full" style={{ direction: 'rtl' }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="monthName" 
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              angle={0}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              yAxisId="left"
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ 
                value: t('orders') || 'Orders', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6b7280' }
              }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ 
                value: t('revenue') || 'Revenue', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: '#6b7280' }
              }}
            />
            <Tooltip content={customTooltip} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            <Bar 
              yAxisId="left"
              dataKey="orders" 
              name={t('orders') || 'Orders'}
              fill="#4560FF"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="right"
              dataKey="revenue" 
              name={t('revenue') || 'Revenue'}
              fill="#EBF3FF"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyOrdersChart;

