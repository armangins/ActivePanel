import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

export const VariationsErrorBoundary = ({ children }: { children: React.ReactNode }) => (
    <FeatureErrorBoundary featureName="Variations">
        {children}
    </FeatureErrorBoundary>
);
