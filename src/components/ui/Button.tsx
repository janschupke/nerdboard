import React, { useMemo } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.memo<ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    className = '',
    ...props
  }) => {
    // Memoize className to prevent object recreation
    const buttonClassName = useMemo(() => {
      const baseClasses =
        'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
      const variantClasses: Record<string, string> = {
        primary: 'bg-accent-primary text-accent-inverse hover:bg-accent-hover',
        secondary: 'bg-surface-secondary text-theme-primary hover:bg-surface-tertiary',
        muted: 'bg-surface-muted text-theme-secondary hover:bg-surface-tertiary',
      };
      const sizeClasses: Record<string, string> = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      };
      return `${baseClasses} ${variantClasses[variant] || ''} ${sizeClasses[size] || ''} ${className}`;
    }, [variant, size, className]);

    return (
      <button className={buttonClassName} onClick={onClick} disabled={disabled} {...props}>
        {children}
      </button>
    );
  },
);
