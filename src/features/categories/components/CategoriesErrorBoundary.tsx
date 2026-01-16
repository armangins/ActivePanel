import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

export const CategoriesErrorBoundary = ({ children }: { children: React.ReactNode }) => (
    <FeatureErrorBoundary featureName="Categories">
        {children}
    </FeatureErrorBoundary>
);
