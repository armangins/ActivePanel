import { Component, ReactNode, ErrorInfo } from 'react';
import { Button, Result, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface FeatureErrorBoundaryProps {
    children: ReactNode;
    featureName?: string;
}

interface FeatureErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Feature-Level Error Boundary
 * 
 * Wraps individual features to prevent a single feature crash from breaking the entire app.
 * Displays a contained error message with a retry option.
 */
export class FeatureErrorBoundary extends Component<FeatureErrorBoundaryProps, FeatureErrorBoundaryState> {
    constructor(props: FeatureErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): Partial<FeatureErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error(`FeatureErrorBoundary caught an error in ${this.props.featureName || 'unknown feature'}:`, error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        // Optional: Trigger a re-fetch or reset logic here if needed via props
    };

    render(): ReactNode {
        const isDev = (import.meta as any).env?.DEV;

        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px dashed #ff4d4f',
                    minHeight: '200px',
                    height: '100%',
                    width: '100%'
                }}>
                    <Result
                        status="warning"
                        title="Feature Unavailable"
                        subTitle={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <Text type="secondary">
                                    {this.props.featureName ? `The ${this.props.featureName} feature encountered a problem.` : 'This component encountered a problem.'}
                                </Text>
                                {isDev && this.state.error && (
                                    <Text type="danger" style={{ fontSize: '12px', maxWidth: '400px' }}>
                                        {this.state.error.message}
                                    </Text>
                                )}
                            </div>
                        }
                        extra={
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={this.handleRetry}
                            >
                                Retry
                            </Button>
                        }
                    />
                </div>
            );
        }

        return this.props.children;
    }
}
