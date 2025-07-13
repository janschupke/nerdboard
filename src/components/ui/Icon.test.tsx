import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders with default props', () => {
    render(<Icon name="crypto" />);
    expect(screen.getByText('💎')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Icon name="crypto" size="sm" />);
    expect(screen.getByText('💎')).toBeInTheDocument();

    rerender(<Icon name="crypto" size="md" />);
    expect(screen.getByText('💎')).toBeInTheDocument();

    rerender(<Icon name="crypto" size="lg" />);
    expect(screen.getByText('💎')).toBeInTheDocument();
  });

  it('renders with string size values', () => {
    const { rerender } = render(<Icon name="crypto" size="sm" />);
    expect(screen.getByText('💎')).toBeInTheDocument();

    rerender(<Icon name="crypto" size="md" />);
    expect(screen.getByText('💎')).toBeInTheDocument();

    rerender(<Icon name="crypto" size="lg" />);
    expect(screen.getByText('💎')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Icon name="crypto" size="md" className="text-blue-500" />);
    const icon = screen.getByText('💎').closest('span');
    expect(icon).toHaveClass('text-blue-500');
  });

  it('renders different icon names', () => {
    const { rerender } = render(<Icon name="crypto" />);
    expect(screen.getByText('💎')).toBeInTheDocument();

    rerender(<Icon name="weather" />);
    expect(screen.getByText('🌤')).toBeInTheDocument();

    rerender(<Icon name="chart" />);
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  it('has correct attributes', () => {
    render(<Icon name="crypto" size="md" />);
    const icon = screen.getByText('💎').closest('span');
    expect(icon).toHaveClass('w-6', 'h-6', 'flex', 'items-center', 'justify-center');
    expect(icon).toHaveAttribute('role', 'img');
    expect(icon).toHaveAttribute('aria-label', 'crypto');
  });
});
