import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders with default props', () => {
    render(<Icon name="crypto" />);
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Icon name="crypto" size={16} />);
    expect(screen.getByText('C')).toBeInTheDocument();

    rerender(<Icon name="crypto" size={24} />);
    expect(screen.getByText('C')).toBeInTheDocument();

    rerender(<Icon name="crypto" size={32} />);
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('renders with string size values', () => {
    const { rerender } = render(<Icon name="crypto" size="sm" />);
    expect(screen.getByText('C')).toBeInTheDocument();

    rerender(<Icon name="crypto" size="md" />);
    expect(screen.getByText('C')).toBeInTheDocument();

    rerender(<Icon name="crypto" size="lg" />);
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Icon name="crypto" size={24} className="text-blue-500" />);
    const icon = screen.getByText('C').closest('svg');
    expect(icon).toHaveClass('text-blue-500');
  });

  it('renders different icon names', () => {
    const { rerender } = render(<Icon name="crypto" />);
    expect(screen.getByText('C')).toBeInTheDocument();

    rerender(<Icon name="weather" />);
    expect(screen.getByText('W')).toBeInTheDocument();

    rerender(<Icon name="chart" />);
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('has correct SVG attributes', () => {
    render(<Icon name="crypto" size={24} />);
    const svg = screen.getByText('C').closest('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
