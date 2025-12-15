import React, { Suspense, lazy } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useQueryClient } from '@tanstack/react-query';
import { LoadingState, ErrorState, Card, SetupRequired } from '../ui';
import { useDashboardLogic } from './hooks/useDashboardLogic';
import { useDashboardSidebar } from './hooks/useDashboardSidebar';
import { useSettings } from '../../contexts/SettingsContext';
import { Link } from 'react-router-dom';
import { Row, Col, Skeleton } from 'antd';


// These are loaded immediately as they are above the fold or essential for the initial view
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';


// These are loaded only when needed to improve initial load time
const RecentOrdersTable = lazy(() => import('./RecentOrder/RecentOrdersTable'));
const EarningsWidget = lazy(() => import('./EarningsWidget'));

// Lazy Load Sidebars (Hidden by default)
const DashboardSidebar = lazy(() => import('./DashboardSidebar'));

// Placeholder UI shown while lazy-loaded components are being fetched
const WidgetSkeleton = () => (
  <Card>
    <Skeleton active paragraph={{ rows: 8 }} />
  </Card>
);

/**
 * Dashboard Component
 * 
 * The main dashboard view of the application.
 * Displays key statistics, charts, recent orders, and other insights.
 * Uses a grid layout that adapts to different screen sizes.
 */
const Dashboard = () => {
  // Global hooks for language and query client
  const { t, formatCurrency, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const { settings, loading: settingsLoading } = useSettings();

  // Check if WooCommerce settings are configured
  const hasConsumerKey = settings?.hasConsumerKey || !!(settings?.consumerKey && settings.consumerKey.trim());
  const hasConsumerSecret = settings?.hasConsumerSecret || !!(settings?.consumerSecret && settings.consumerSecret.trim());
  const hasSettings = !!(settings && hasConsumerKey && hasConsumerSecret);

  // Custom Hook: useDashboardLogic
  // Handles all data fetching and state management for the dashboard
  // Returns loading states, error states, and all data needed for the UI
  const dashboardData = useDashboardLogic();
  const {
    stats,
    changes,
    recentOrders,
    allOrdersFromStats,
    lowStockCount,
    loading,
    loadingSecondary,
    error
  } = dashboardData;

  // Custom Hook: useDashboardSidebar
  // Manages the state and interactions for the various sidebars (Low Stock, etc.)
  // Handles click events on dashboard cards to open relevant sidebars
  const {
    handleCardClick,
    handleLowStockClick,
    handleBarClick,
    sidebarProps
  } = useDashboardSidebar(dashboardData, t, formatCurrency);

  // 1. Initial Loading State - REMOVED to show skeletons instead
  // if (loading) {
  //   return <LoadingState message={t('loadingDashboardData') || 'מעבדים את הנתונים… עוד שנייה ואנחנו שם.'} fullHeight />;
  // }

  // 2. Show setup message if settings aren't configured
  if (!settingsLoading && !hasSettings) {
    return (
      <div style={{ direction: 'rtl' }}>
        <DashboardHeader t={t} isRTL={isRTL} />
        <SetupRequired
          title={t('welcomeToDashboard') || 'ברוכים הבאים לדשבורד'}
          description={t('configureWooCommerceSettings') || 'כדי להתחיל, אנא הגדר את הגדרות WooCommerce שלך.'}
        />
      </div>
    );
  }

  // 3. Error State
  // Shown if critical data fetching fails
  if (error) {
    // Generic secure error message
    const errorMessage = 'אופס, נראה שעדיין אין מידע להציג';

    return (
      <ErrorState
        error={errorMessage}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })}
        t={t}
        fullPage
      />
    );
  }

  // 4. Main Dashboard Render
  return (
    <div style={{ direction: 'rtl' }} data-onboarding="dashboard">
      {/* Displays the dashboard title and global actions */}
      <DashboardHeader t={t} isRTL={isRTL} />

      {/* Shown immediately. Displays cards for Revenue, Orders, Customers, etc. */}
      {loading || loadingSecondary ? (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <DashboardStats
          stats={stats}
          changes={changes}
          lowStockCount={lowStockCount}
          formatCurrency={formatCurrency}
          t={t}
          isRTL={isRTL}
          onCardClick={handleCardClick}
          onLowStockClick={handleLowStockClick}
        />
      )}
      {/* Contains the Earnings Chart and Recent Orders list */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Column 1: Recent Orders List */}
        <Col xs={24} lg={8}>
          {loading ? (
            <WidgetSkeleton />
          ) : (
            <Suspense fallback={<WidgetSkeleton />}>
              <Card
                hoverable
                onClick={() => handleCardClick('recentOrders')}
                style={{ height: '100%' }}
              >
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, textAlign: 'right' }}>
                  {t('recentOrders')}
                </h2>
                <RecentOrdersTable
                  orders={recentOrders}
                  formatCurrency={formatCurrency}
                  t={t}
                  isRTL={isRTL}
                />
              </Card>
            </Suspense>
          )}
        </Col>
        <Col xs={24} lg={16}>
          {loading ? (
            <WidgetSkeleton />
          ) : (
            <Suspense fallback={<WidgetSkeleton />}>
              <EarningsWidget
                orders={allOrdersFromStats}
                formatCurrency={formatCurrency}
                t={t}
                isRTL={isRTL}
                onBarClick={handleBarClick}
              />
            </Suspense>
          )}
        </Col>
      </Row>

      {/* Sidebar: Generic Dashboard Sidebar */}
      {sidebarProps.isOpen && (
        <Suspense fallback={null}>
          <DashboardSidebar {...sidebarProps} />
        </Suspense>
      )}
    </div>
  );
};

export default Dashboard;
