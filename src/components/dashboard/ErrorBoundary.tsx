import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(): void {
    // You can log the error to an error reporting service here
    // console.error("ErrorBoundary caught an error");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-600" data-testid="error-boundary-message">
          There was an error loading this component.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
