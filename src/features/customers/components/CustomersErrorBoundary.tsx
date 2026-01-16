import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

export const CustomersErrorBoundary = ({ children }: { children: React.ReactNode }) => (
    <FeatureErrorBoundary featureName="Customers">
        {children}
    </FeatureErrorBoundary>
);
