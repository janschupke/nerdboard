import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSkeleton } from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingSkeleton />);

    const skeletonElement = container.firstChild as HTMLElement;
    expect(skeletonElement).toBeInTheDocument();
    expect(skeletonElement.className).toContain('animate-pulse');
    expect(skeletonElement.className).toContain('h-48'); // default medium size
  });

  it('renders with small tile size', () => {
    const { container } = render(<LoadingSkeleton tileSize="small" />);

    const skeletonElement = container.firstChild as HTMLElement;
    expect(skeletonElement.className).toContain('h-32');
  });

  it('renders with medium tile size', () => {
    const { container } = render(<LoadingSkeleton tileSize="medium" />);

    const skeletonElement = container.firstChild as HTMLElement;
    expect(skeletonElement.className).toContain('h-48');
  });

  it('renders with large tile size', () => {
    const { container } = render(<LoadingSkeleton tileSize="large" />);

    const skeletonElement = container.firstChild as HTMLElement;
    expect(skeletonElement.className).toContain('h-64');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSkeleton className="custom-class" />);

    const skeletonElement = container.firstChild as HTMLElement;
    expect(skeletonElement.className).toContain('custom-class');
  });

  it('renders header skeleton', () => {
    const { container } = render(<LoadingSkeleton />);

    const headerSkeleton = container.querySelector('.h-12.bg-surface-tertiary.rounded-t-lg');
    expect(headerSkeleton).toBeInTheDocument();
  });

  it('renders content skeleton with correct number of lines for medium size', () => {
    const { container } = render(<LoadingSkeleton tileSize="medium" />);

    const contentLines = container.querySelectorAll('.h-4.bg-surface-tertiary.rounded');
    expect(contentLines).toHaveLength(3); // 3 lines for medium size
  });

  it('renders content skeleton with correct number of lines for large size', () => {
    const { container } = render(<LoadingSkeleton tileSize="large" />);

    const contentLines = container.querySelectorAll('.h-4.bg-surface-tertiary.rounded');
    expect(contentLines).toHaveLength(5); // 5 lines for large size (3 default + 2 additional)
  });

  it('renders content skeleton with correct number of lines for small size', () => {
    const { container } = render(<LoadingSkeleton tileSize="small" />);

    const contentLines = container.querySelectorAll('.h-4.bg-surface-tertiary.rounded');
    expect(contentLines).toHaveLength(3); // 3 lines for small size
  });

  it('has correct structure with header and content', () => {
    const { container } = render(<LoadingSkeleton />);

    const mainContainer = container.firstChild as HTMLElement;
    const headerSkeleton = mainContainer.querySelector('.h-12');
    const contentSkeleton = mainContainer.querySelector('.flex-1.p-4.space-y-3');

    expect(headerSkeleton).toBeInTheDocument();
    expect(contentSkeleton).toBeInTheDocument();
  });

  it('applies correct width classes to content lines', () => {
    const { container } = render(<LoadingSkeleton />);

    const contentLines = container.querySelectorAll('.h-4.bg-surface-tertiary.rounded');
    expect(contentLines[0].className).toContain('w-3/4');
    expect(contentLines[1].className).toContain('w-1/2');
    expect(contentLines[2].className).toContain('w-2/3');
  });

  it('applies correct width classes for large size additional lines', () => {
    const { container } = render(<LoadingSkeleton tileSize="large" />);

    const contentLines = container.querySelectorAll('.h-4.bg-surface-tertiary.rounded');
    expect(contentLines[3].className).toContain('w-1/3');
    expect(contentLines[4].className).toContain('w-4/5');
  });

  it('has correct background classes', () => {
    const { container } = render(<LoadingSkeleton />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.querySelector('.bg-surface-secondary')).toBeInTheDocument();
    expect(mainContainer.querySelector('.bg-surface-tertiary')).toBeInTheDocument();
  });

  it('has correct border radius classes', () => {
    const { container } = render(<LoadingSkeleton />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.querySelector('.rounded-lg')).toBeInTheDocument();
    expect(mainContainer.querySelector('.rounded-t-lg')).toBeInTheDocument();
  });
});
