import React from 'react';

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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {this.state.errorInfo && import.meta.env.DEV && (
              <details className="mt-4 text-xs text-gray-500">
                <summary className="cursor-pointer mb-2">Error Details (Dev Only)</summary>
                <pre className="overflow-auto bg-gray-100 p-2 rounded">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="btn-primary mt-4"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

