import React, { Suspense, lazy } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useQueryClient } from '@tanstack/react-query';
import { LoadingState, ErrorState } from '../ui';
import { useDashboardLogic } from './hooks/useDashboardLogic';
import { useDashboardSidebar } from './hooks/useDashboardSidebar';


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
  <div className="card animate-pulse h-full min-h-[300px]">
    <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
    <div className="h-64 bg-gray-100 rounded"></div>
  </div>
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

  // 2. Error State
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

  // 3. Main Dashboard Render
  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* Displays the dashboard title and global actions */}
      <DashboardHeader t={t} isRTL={isRTL} />

      {/* Shown immediately. Displays cards for Revenue, Orders, Customers, etc. */}
      {loading || loadingSecondary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Recent Orders List */}
        {/* Takes 1/3 width on large screens. Shows the 5 most recent orders. */}
        <div className="lg:col-span-1">
          {loading ? (
            <WidgetSkeleton />
          ) : (
            <Suspense fallback={<WidgetSkeleton />}>
              <div
                className="card cursor-pointer hover:shadow-lg transition-shadow h-full"
                onClick={() => handleCardClick('recentOrders')}
              >
                <h2 className={`text-xl font-semibold text-gray-900 mb-4 ${'text-right'}`}>
                  {t('recentOrders')}
                </h2>
                <RecentOrdersTable
                  orders={recentOrders}
                  formatCurrency={formatCurrency}
                  t={t}
                  isRTL={isRTL}
                />
              </div>
            </Suspense>
          )}
        </div>
        <div className="lg:col-span-2">
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
        </div>
      </div>

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
