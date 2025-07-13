import React from 'react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { LogProvider } from '../../contexts/LogContext';

export const TestProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <LogProvider>
        {children}
      </LogProvider>
    </ThemeProvider>
  );
}; 
