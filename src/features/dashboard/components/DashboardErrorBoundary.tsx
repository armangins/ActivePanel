import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

export const DashboardErrorBoundary = ({ children }: { children: React.ReactNode }) => (
    <FeatureErrorBoundary featureName="Dashboard">
        {children}
    </FeatureErrorBoundary>
);
