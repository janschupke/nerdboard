import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders with default props', () => {
    render(<Icon name="crypto" />);

    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-label', 'crypto');
  });

  it('renders with custom className', () => {
    render(<Icon name="crypto" className="custom-class" />);

    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('custom-class');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Icon name="crypto" size="sm" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('w-4', 'h-4');

    rerender(<Icon name="crypto" size="md" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('w-6', 'h-6');

    rerender(<Icon name="crypto" size="lg" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('w-8', 'h-8');
  });

  it('renders cryptocurrency icons', () => {
    render(<Icon name="bitcoin" />);
    expect(screen.getByText('₿')).toBeInTheDocument();

    render(<Icon name="ethereum" />);
    expect(screen.getByText('Ξ')).toBeInTheDocument();

    render(<Icon name="crypto" />);
    expect(screen.getByText('💎')).toBeInTheDocument();
  });

  it('renders precious metals icons', () => {
    render(<Icon name="gold" />);
    expect(screen.getByText('🥇')).toBeInTheDocument();

    render(<Icon name="silver" />);
    expect(screen.getByText('🥈')).toBeInTheDocument();

    render(<Icon name="metals" />);
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('renders UI icons', () => {
    render(<Icon name="close" />);
    expect(screen.getByText('✕')).toBeInTheDocument();

    render(<Icon name="add" />);
    expect(screen.getByText('+')).toBeInTheDocument();

    render(<Icon name="menu" />);
    expect(screen.getByText('☰')).toBeInTheDocument();

    render(<Icon name="drag" />);
    expect(screen.getByText('⋮⋮')).toBeInTheDocument();

    render(<Icon name="resize" />);
    expect(screen.getByText('⤡')).toBeInTheDocument();

    render(<Icon name="settings" />);
    expect(screen.getByText('⚙')).toBeInTheDocument();

    render(<Icon name="refresh" />);
    expect(screen.getByText('↻')).toBeInTheDocument();

    render(<Icon name="error" />);
    expect(screen.getByText('⚠')).toBeInTheDocument();

    render(<Icon name="success" />);
    expect(screen.getByText('✓')).toBeInTheDocument();

    render(<Icon name="loading" />);
    expect(screen.getByText('⟳')).toBeInTheDocument();
  });

  it('renders theme icons', () => {
    render(<Icon name="sun" />);
    expect(screen.getByText('☀')).toBeInTheDocument();

    render(<Icon name="moon" />);
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('renders fallback for unknown icon', () => {
    render(<Icon name="unknown" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('applies correct base classes', () => {
    render(<Icon name="crypto" />);

    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('combines size and custom classes', () => {
    render(<Icon name="crypto" size="md" className="text-blue-500" />);

    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('w-6', 'h-6', 'text-blue-500');
  });
});
