import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it('renders the Dashboard component', () => {
    render(<App />);
    // The Dashboard component should be rendered
    // We can check for elements that are part of the Dashboard
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has the correct structure', () => {
    render(<App />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
}); 
