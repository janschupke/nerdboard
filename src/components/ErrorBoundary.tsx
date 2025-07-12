import React from 'react';
import type { ErrorBoundaryState } from '../types/errors';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
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
    
    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        console.error('Error in error boundary handler:', handlerError);
      }
    }

    // Report error to external service in production
    if (import.meta.env.PROD) {
      this.reportError(error, errorInfo);
    }
  }

  private reportError(error: Error, errorInfo: React.ErrorInfo) {
    // In a real application, this would send to an error reporting service
    // like Sentry, LogRocket, or similar
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      
      // Example: send to error reporting service
      // errorReportingService.captureException(errorReport);
      console.log('Error report:', errorReport);
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
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
        <div className="p-6 text-center bg-surface-secondary border border-error-200 rounded-lg">
          <div className="mb-4">
            <Icon name="warning" size="lg" className="text-error-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-error-600 mb-2">
              Something went wrong
            </h2>
            <p className="text-theme-secondary mb-4 text-sm">
              We're sorry, but there was an error loading this component. 
              This has been automatically reported to our team.
            </p>
            {this.state.error && (
              <details className="text-xs text-theme-tertiary mb-4">
                <summary className="cursor-pointer hover:text-theme-secondary">
                  Error details (for developers)
                </summary>
                <pre className="mt-2 text-left bg-surface-primary p-2 rounded overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="primary" size="sm" onClick={this.resetError}>
              Try Again
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { DashboardErrorBoundary as ErrorBoundary };
