import type { ThemeTokens } from './tokens';

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  tokens: ThemeTokens;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark';
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  tokens: ThemeTokens;
}
