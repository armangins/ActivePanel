import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

export const ProductsErrorBoundary = ({ children }: { children: React.ReactNode }) => (
    <FeatureErrorBoundary featureName="Products">
        {children}
    </FeatureErrorBoundary>
);
