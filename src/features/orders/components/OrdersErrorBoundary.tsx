import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

export const OrdersErrorBoundary = ({ children }: { children: React.ReactNode }) => (
    <FeatureErrorBoundary featureName="Orders">
        {children}
    </FeatureErrorBoundary>
);
