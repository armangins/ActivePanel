import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

export const AttributesErrorBoundary = ({ children }: { children: React.ReactNode }) => (
    <FeatureErrorBoundary featureName="Attributes">
        {children}
    </FeatureErrorBoundary>
);
