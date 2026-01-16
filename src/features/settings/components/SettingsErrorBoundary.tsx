import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

export const SettingsErrorBoundary = ({ children }: { children: React.ReactNode }) => (
    <FeatureErrorBoundary featureName="Settings">
        {children}
    </FeatureErrorBoundary>
);
