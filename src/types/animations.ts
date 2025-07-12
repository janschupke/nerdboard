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
  enter: { duration: 300, easing: 'ease-out' },
  exit: { duration: 200, easing: 'ease-in' },
  move: { duration: 250, easing: 'ease-in-out' },
  resize: { duration: 200, easing: 'ease-out' },
};
