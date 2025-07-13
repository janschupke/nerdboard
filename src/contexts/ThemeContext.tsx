import React, { createContext, useState, useCallback, useMemo, useLayoutEffect } from 'react';
import type { ThemeContextType } from '../theme/types';
import { THEME_TOKENS } from '../theme/tokens';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = React.memo<{ children: React.ReactNode }>(({ children }) => {
  // Get initial theme from localStorage or system preference
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nerdboard-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme());

  // Persist theme to localStorage and set document attribute
  useLayoutEffect(() => {
    localStorage.setItem('nerdboard-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev: 'light' | 'dark') => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setThemeMode = useCallback((newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    setTheme: setThemeMode,
    tokens: THEME_TOKENS,
  }), [theme, toggleTheme, setThemeMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
});

export { ThemeContext };
