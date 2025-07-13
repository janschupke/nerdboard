import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';

// Test wrapper with necessary providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />, { wrapper: TestWrapper });
    expect(document.body).toBeInTheDocument();
  });

  it('renders the Dashboard component', () => {
    render(<App />, { wrapper: TestWrapper });
    // The Dashboard component should be rendered
    // We can check for elements that are part of the Dashboard
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('has the correct structure', () => {
    render(<App />, { wrapper: TestWrapper });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
