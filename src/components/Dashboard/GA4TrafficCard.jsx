import { Users, Eye, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * GA4TrafficCard Component
 * 
 * Displays traffic data from Google Analytics 4 (sessions, users, page views).
 * 
 * @param {Object} data - GA4 traffic data
 * @param {Function} t - Translation function
 * @param {boolean} isRTL - Whether the layout is right-to-left
 */
const GA4TrafficCard = ({ data, t, isRTL }) => {
  if (!data || !data.rows || data.rows.length === 0) {
    return (
      <div className="card">
        <div className={`text-center py-8 ${'text-right'}`}>
          <p className="text-gray-500">{t('noGA4Data') || 'No GA4 data available'}</p>
          <p className="text-xs text-gray-400 mt-2">
            {t('configureGA4') || 'Configure GA4 in Settings'}
          </p>
        </div>
      </div>
    );
  }

  // Extract metrics from GA4 response
  const metrics = data.rows?.[0]?.metricValues || [];
  const sessions = metrics[0]?.value || '0';
  const users = metrics[1]?.value || '0';
  const pageViews = metrics[2]?.value || '0';

  return (
    <div className="card">
      <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${'text-right'}`}>
        {t('ga4Traffic') || 'GA4 Traffic'}
      </h3>
      <div className="space-y-4">
        <div className={`flex items-center justify-between ${'flex-row-reverse'}`}>
          <div className={`flex items-center gap-2 ${'flex-row-reverse'}`}>
            <Users size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">{t('sessions') || 'Sessions'}</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">{parseInt(sessions).toLocaleString()}</span>
        </div>
        <div className={`flex items-center justify-between ${'flex-row-reverse'}`}>
          <div className={`flex items-center gap-2 ${'flex-row-reverse'}`}>
            <Users size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">{t('users') || 'Users'}</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">{parseInt(users).toLocaleString()}</span>
        </div>
        <div className={`flex items-center justify-between ${'flex-row-reverse'}`}>
          <div className={`flex items-center gap-2 ${'flex-row-reverse'}`}>
            <Eye size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">{t('pageViews') || 'Page Views'}</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">{parseInt(pageViews).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default GA4TrafficCard;


