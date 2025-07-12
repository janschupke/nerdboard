import React from 'react';
import type { ErrorBoundaryState } from '../types/errors';
import { Button } from './ui/Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class DashboardErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error('Dashboard Error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold text-error-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            We're sorry, but there was an error loading this component.
          </p>
          <Button variant="primary" size="sm" onClick={this.resetError}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export { DashboardErrorBoundary as ErrorBoundary };
