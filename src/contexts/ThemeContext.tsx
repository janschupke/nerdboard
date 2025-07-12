import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Check if the dark class is already set by the inline script
    const isDark = document.documentElement.classList.contains('dark');
    const stored = localStorage.getItem('theme') as Theme | null;
    
    if (stored) {
      setThemeState(stored);
      // Only update the class if it doesn't match the stored theme
      if ((stored === 'dark') !== isDark) {
        document.documentElement.classList.toggle('dark', stored === 'dark');
      }
    } else {
      // Default to system preference or current class state
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const newTheme = isDark || prefersDark ? 'dark' : 'light';
      setThemeState(newTheme);
      // Only update the class if it doesn't match the new theme
      if ((newTheme === 'dark') !== isDark) {
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      }
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
} 
