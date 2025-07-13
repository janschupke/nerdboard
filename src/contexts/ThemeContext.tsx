import React, { useState, useEffect } from 'react';
import type { ThemeProviderProps, ThemeContextType } from '../theme/types';
import { THEME_TOKENS } from '../theme/tokens';
import { ThemeContext } from './ThemeContextDef';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'light',
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem('nerdboard-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nerdboard-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    tokens: THEME_TOKENS,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
