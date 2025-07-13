import React from 'react';

interface IconProps {
  name: string;
  size?: number | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Icon = React.memo<IconProps>(({ name, size = 16, className = '' }) => {
  // Convert string sizes to numbers
  const getSizeValue = (size: number | 'sm' | 'md' | 'lg'): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm': return 16;
      case 'md': return 24;
      case 'lg': return 32;
      default: return 16;
    }
  };

  const sizeValue = getSizeValue(size);

  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Icon content based on name */}
      <text x="12" y="12" textAnchor="middle" dominantBaseline="middle" fontSize="12">
        {name.charAt(0).toUpperCase()}
      </text>
    </svg>
  );
});
