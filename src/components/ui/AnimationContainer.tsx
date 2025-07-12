import { useEffect, useRef } from 'react';
import { UI_CONFIG } from '../../utils/constants';
import { tileAnimations } from '../../types/animations';

interface AnimationContainerProps {
  children: React.ReactNode;
  animation: 'enter' | 'exit' | 'move' | 'resize';
  onAnimationComplete?: () => void;
}

export function AnimationContainer({
  children,
  animation,
  onAnimationComplete,
}: AnimationContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const config = tileAnimations[animation];

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleAnimationEnd = () => {
      onAnimationComplete?.();
    };

    element.addEventListener('animationend', handleAnimationEnd);
    element.addEventListener('transitionend', handleAnimationEnd);

    return () => {
      element.removeEventListener('animationend', handleAnimationEnd);
      element.removeEventListener('transitionend', handleAnimationEnd);
    };
  }, [onAnimationComplete]);

  const getAnimationClasses = () => {
    switch (animation) {
      case 'enter':
        return 'animate-in fade-in slide-in-from-bottom-2';
      case 'exit':
        return 'animate-out fade-out slide-out-to-top-2';
      case 'move':
        return 'transition-all duration-250 ease-in-out';
      case 'resize':
        return `transition-all duration-${UI_CONFIG.ANIMATION_DURATION} ease-out`;
      default:
        return '';
    }
  };

  return (
    <div
      ref={containerRef}
      className={getAnimationClasses()}
      style={{
        transitionDuration: `${config.duration}ms`,
        transitionTimingFunction: config.easing,
      }}
    >
      {children}
    </div>
  );
}
