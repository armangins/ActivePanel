import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Button, Result } from 'antd';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error for debugging
        this.setState({ errorInfo });
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error);
            console.error('Error info:', errorInfo);
        }
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16
                }}>
                    <Result
                        status="error"
                        title="Something went wrong"
                        subTitle={this.state.error?.message || 'An unexpected error occurred'}
                        extra={[
                            <Button
                                key="reload"
                                type="primary"
                                onClick={() => {
                                    this.setState({ hasError: false, error: null, errorInfo: null });
                                    window.location.reload();
                                }}
                            >
                                Reload Page
                            </Button>
                        ]}
                    >
                        {this.state.errorInfo && import.meta.env.DEV && (
                            <details style={{ marginTop: 24, textAlign: 'left' }}>
                                <summary style={{ cursor: 'pointer', marginBottom: 8 }}>
                                    Error Details (Dev Only)
                                </summary>
                                <pre style={{
                                    overflow: 'auto',
                                    backgroundColor: '#f5f5f5',
                                    padding: 8,
                                    borderRadius: 4,
                                    maxHeight: 200,
                                    fontSize: 12
                                }}>
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </Result>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
