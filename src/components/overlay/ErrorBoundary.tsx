import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (_error: Error, _errorInfo: React.ErrorInfo) => void;
  variant?: 'app' | 'component';
}

interface ErrorBoundaryState {
  hasError: boolean;
  _error: Error | null;
  _errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, _error: null, _errorInfo: null };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true, _error, _errorInfo: null };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    this.setState({ hasError: true, _error, _errorInfo });

    // Log error to monitoring service
    console.error('Error Boundary caught an error:', _error, _errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(_error, _errorInfo);
      } catch (handlerError) {
        console.error('Error in error boundary handler:', handlerError);
      }
    }

    // Report error to external service in production (only for app-level errors)
    if (import.meta.env.PROD && this.props.variant === 'app') {
      this.reportError(_error, _errorInfo);
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
    this.setState({ hasError: false, _error: null, _errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent error={new Error('Unknown error')} resetError={this.resetError} />
        );
      }

      // Component-level error boundary (simpler)
      if (this.props.variant === 'component') {
        return (
          <div className="p-4 text-center text-red-600" data-testid="error-boundary-message">
            There was an error loading this component.
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center h-screen w-full">
          <div className="text-center">
            <div className="text-8xl mb-4">🍆</div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
