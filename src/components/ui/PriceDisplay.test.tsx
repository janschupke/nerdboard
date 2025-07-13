import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceDisplay } from './PriceDisplay';

describe('PriceDisplay', () => {
  it('renders price correctly', () => {
    render(<PriceDisplay price={100} />);
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('renders with custom currency', () => {
    render(<PriceDisplay price={100} currency="EUR" />);
    expect(screen.getByText('€100.00')).toBeInTheDocument();
  });

  it('renders with positive change', () => {
    render(<PriceDisplay price={100} showChange={true} changeValue={5.5} changePercent={5.5} />);
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('+5.50 (+5.50%)')).toBeInTheDocument();
  });

  it('renders with negative change', () => {
    render(<PriceDisplay price={100} showChange={true} changeValue={-3.2} changePercent={-3.2} />);
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('-3.20 (-3.20%)')).toBeInTheDocument();
  });

  it('renders without change when showChange is false', () => {
    render(<PriceDisplay price={100} showChange={false} changeValue={5.5} changePercent={5.5} />);
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.queryByText('+5.50')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<PriceDisplay price={100} className="custom-class" />);
    const container = screen.getByText('$100.00').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('handles zero change values', () => {
    render(<PriceDisplay price={100} showChange={true} changeValue={0} changePercent={0} />);
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('+0.00 (+0.00%)')).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    render(<PriceDisplay price={1234567.89} />);
    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
  });

  it('handles decimal precision', () => {
    render(<PriceDisplay price={100.123} />);
    expect(screen.getByText('$100.12')).toBeInTheDocument();
  });
});
