import { UI_CONFIG } from '../contexts/constants';

export interface AnimationConfig {
  duration: number;
  easing: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  delay?: number;
}

export interface TileAnimationProps {
  enter: AnimationConfig;
  exit: AnimationConfig;
  move: AnimationConfig;
  resize: AnimationConfig;
}

export const tileAnimations: TileAnimationProps = {
  enter: { duration: UI_CONFIG.TRANSITION_DURATION, easing: 'ease-out' },
  exit: { duration: UI_CONFIG.ANIMATION_DURATION, easing: 'ease-in' },
  move: { duration: 250, easing: 'ease-in-out' },
  resize: { duration: UI_CONFIG.ANIMATION_DURATION, easing: 'ease-out' },
};
