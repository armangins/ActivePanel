import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

export const CouponsErrorBoundary = ({ children }: { children: React.ReactNode }) => (
    <FeatureErrorBoundary featureName="Coupons">
        {children}
    </FeatureErrorBoundary>
);
