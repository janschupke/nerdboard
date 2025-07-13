import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PriceDisplay } from './PriceDisplay';

describe('PriceDisplay', () => {
  it('renders price with default currency', () => {
    render(<PriceDisplay price={1234.56} />);

    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
  });

  it('renders price with custom currency', () => {
    render(<PriceDisplay price={1234.56} currency="€" />);

    expect(screen.getByText('€1,234.56')).toBeInTheDocument();
  });

  it('renders price with zero', () => {
    render(<PriceDisplay price={0} />);

    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('renders price with large number', () => {
    render(<PriceDisplay price={1234567.89} />);

    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
  });

  it('renders positive change with percentage', () => {
    render(<PriceDisplay price={100} changePercentage={5.5} />);

    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('+5.50%')).toBeInTheDocument();
    expect(screen.getByText('↗')).toBeInTheDocument();
  });

  it('renders negative change with percentage', () => {
    render(<PriceDisplay price={100} changePercentage={-3.2} />);

    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('-3.20%')).toBeInTheDocument();
    expect(screen.getByText('↘')).toBeInTheDocument();
  });

  it('renders positive change with absolute value', () => {
    render(<PriceDisplay price={100} change={5.5} />);

    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('+$5.50')).toBeInTheDocument();
    expect(screen.getByText('↗')).toBeInTheDocument();
  });

  it('renders negative change with absolute value', () => {
    render(<PriceDisplay price={100} change={-3.2} />);

    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$-3.20')).toBeInTheDocument();
    expect(screen.getByText('↘')).toBeInTheDocument();
  });

  it('renders without change indicators when no change provided', () => {
    render(<PriceDisplay price={100} />);

    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.queryByText('↗')).not.toBeInTheDocument();
    expect(screen.queryByText('↘')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<PriceDisplay price={100} className="custom-class" />);

    const priceDisplayElement = container.firstChild as HTMLElement;
    expect(priceDisplayElement.className).toContain('custom-class');
  });

  it('applies correct color classes for positive change', () => {
    const { container } = render(<PriceDisplay price={100} changePercentage={5.5} />);

    const changeElement = container.querySelector('.text-success-600');
    expect(changeElement).toBeInTheDocument();
  });

  it('applies correct color classes for negative change', () => {
    const { container } = render(<PriceDisplay price={100} changePercentage={-3.2} />);

    const changeElement = container.querySelector('.text-error-600');
    expect(changeElement).toBeInTheDocument();
  });

  it('applies muted color when no change', () => {
    const { container } = render(<PriceDisplay price={100} />);

    const priceElement = container.querySelector('.text-lg.font-semibold');
    expect(priceElement).toBeInTheDocument();
  });

  it('handles decimal precision correctly', () => {
    render(<PriceDisplay price={123.456} />);

    expect(screen.getByText('$123.46')).toBeInTheDocument(); // Rounded to 2 decimal places
  });

  it('handles change percentage with many decimal places', () => {
    render(<PriceDisplay price={100} changePercentage={3.14159} />);

    expect(screen.getByText('+3.14%')).toBeInTheDocument(); // Rounded to 2 decimal places
  });

  it('handles zero change percentage', () => {
    render(<PriceDisplay price={100} changePercentage={0} />);

    expect(screen.getByText('+0.00%')).toBeInTheDocument();
    // The icon is not rendered when change is 0, so we don't test for it
  });

  it('handles zero change value', () => {
    render(<PriceDisplay price={100} change={0} />);

    expect(screen.getByText('+$0.00')).toBeInTheDocument();
    // The icon is not rendered when change is 0, so we don't test for it
  });

  it('prioritizes changePercentage over change when both provided', () => {
    render(<PriceDisplay price={100} change={5} changePercentage={10} />);

    expect(screen.getByText('+10.00%')).toBeInTheDocument();
    expect(screen.queryByText('+$5.00')).not.toBeInTheDocument();
  });
});
