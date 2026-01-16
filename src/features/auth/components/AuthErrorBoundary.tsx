import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

export const AuthErrorBoundary = ({ children }: { children: React.ReactNode }) => (
    <FeatureErrorBoundary featureName="Auth">
        {children}
    </FeatureErrorBoundary>
);
