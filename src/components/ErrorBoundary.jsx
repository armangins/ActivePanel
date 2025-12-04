import React from 'react';
import StatusMessage from './ui/states/StatusMessage';
import { Button } from './ui';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    this.setState({ errorInfo });
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
          <div className="w-full max-w-md">
            <StatusMessage
              type="error"
              title="Something went wrong"
              message={
                <>
                  <span className="block mb-2">{this.state.error?.message || 'An unexpected error occurred'}</span>
                  {this.state.errorInfo && import.meta.env.DEV && (
                    <details className="mt-4 text-xs text-gray-500 text-left">
                      <summary className="cursor-pointer mb-2">Error Details (Dev Only)</summary>
                      <pre className="overflow-auto bg-gray-100 p-2 rounded max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </>
              }
              action={
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null, errorInfo: null });
                    window.location.reload();
                  }}
                  variant="primary"
                  className="mt-4"
                >
                  Reload Page
                </Button>
              }
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

