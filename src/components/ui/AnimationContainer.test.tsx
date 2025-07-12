import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnimationContainer } from './AnimationContainer';

describe('AnimationContainer', () => {
  it('renders children correctly', () => {
    render(
      <AnimationContainer animation="enter">
        <div>Test content</div>
      </AnimationContainer>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies enter animation classes', () => {
    const { container } = render(
      <AnimationContainer animation="enter">
        <div>Test content</div>
      </AnimationContainer>
    );

    const animationDiv = container.firstChild as HTMLElement;
    expect(animationDiv.className).toContain('animate-in');
    expect(animationDiv.className).toContain('fade-in');
    expect(animationDiv.className).toContain('slide-in-from-bottom-2');
  });

  it('applies exit animation classes', () => {
    const { container } = render(
      <AnimationContainer animation="exit">
        <div>Test content</div>
      </AnimationContainer>
    );

    const animationDiv = container.firstChild as HTMLElement;
    expect(animationDiv.className).toContain('animate-out');
    expect(animationDiv.className).toContain('fade-out');
    expect(animationDiv.className).toContain('slide-out-to-top-2');
  });

  it('applies move animation classes', () => {
    const { container } = render(
      <AnimationContainer animation="move">
        <div>Test content</div>
      </AnimationContainer>
    );

    const animationDiv = container.firstChild as HTMLElement;
    expect(animationDiv.className).toContain('transition-all');
    expect(animationDiv.className).toContain('duration-250');
    expect(animationDiv.className).toContain('ease-in-out');
  });

  it('applies resize animation classes', () => {
    const { container } = render(
      <AnimationContainer animation="resize">
        <div>Test content</div>
      </AnimationContainer>
    );

    const animationDiv = container.firstChild as HTMLElement;
    expect(animationDiv.className).toContain('transition-all');
    expect(animationDiv.className).toContain('duration-200');
    expect(animationDiv.className).toContain('ease-out');
  });

  it('calls onAnimationComplete when animation ends', () => {
    const onAnimationComplete = vi.fn();
    
    const { container } = render(
      <AnimationContainer animation="enter" onAnimationComplete={onAnimationComplete}>
        <div>Test content</div>
      </AnimationContainer>
    );

    const animationDiv = container.firstChild as HTMLElement;
    
    // Simulate animation end
    fireEvent.animationEnd(animationDiv);
    
    expect(onAnimationComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onAnimationComplete when transition ends', () => {
    const onAnimationComplete = vi.fn();
    
    const { container } = render(
      <AnimationContainer animation="move" onAnimationComplete={onAnimationComplete}>
        <div>Test content</div>
      </AnimationContainer>
    );

    const animationDiv = container.firstChild as HTMLElement;
    
    // Simulate transition end
    fireEvent.transitionEnd(animationDiv);
    
    expect(onAnimationComplete).toHaveBeenCalledTimes(1);
  });

  it('does not call onAnimationComplete when not provided', () => {
    const { container } = render(
      <AnimationContainer animation="enter">
        <div>Test content</div>
      </AnimationContainer>
    );

    const animationDiv = container.firstChild as HTMLElement;
    
    // This should not throw an error
    expect(() => {
      fireEvent.animationEnd(animationDiv);
    }).not.toThrow();
  });

  it('applies correct style properties for animation', () => {
    const { container } = render(
      <AnimationContainer animation="enter">
        <div>Test content</div>
      </AnimationContainer>
    );

    const animationDiv = container.firstChild as HTMLElement;
    expect(animationDiv.style.transitionDuration).toBe('300ms');
    expect(animationDiv.style.transitionTimingFunction).toBe('ease-out');
  });

  it('handles multiple animation events correctly', () => {
    const onAnimationComplete = vi.fn();
    
    const { container } = render(
      <AnimationContainer animation="enter" onAnimationComplete={onAnimationComplete}>
        <div>Test content</div>
      </AnimationContainer>
    );

    const animationDiv = container.firstChild as HTMLElement;
    
    // Simulate multiple animation events
    fireEvent.animationEnd(animationDiv);
    fireEvent.transitionEnd(animationDiv);
    
    expect(onAnimationComplete).toHaveBeenCalledTimes(2);
  });
}); 
