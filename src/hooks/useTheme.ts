import { useContext } from 'react';
import type { ThemeContextType } from '../theme/types';
import { ThemeContext } from '../contexts/ThemeContextDef';

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
