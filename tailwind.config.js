/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light Theme Colors
        'theme-bg': {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
        },
        'theme-surface': {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
        },
        'theme-border': {
          primary: '#e2e8f0',
          secondary: '#cbd5e1',
          tertiary: '#94a3b8',
        },
        'theme-text': {
          primary: '#0f172a',
          secondary: '#334155',
          tertiary: '#64748b',
          inverse: '#ffffff',
        },
        'theme-interactive': {
          primary: '#3b82f6',
          secondary: '#1e40af',
          hover: '#60a5fa',
          active: '#2563eb',
        },
        'theme-status': {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        'theme-accent': {
          primary: '#3b82f6',
          secondary: '#1e40af',
          muted: '#dbeafe',
        },

        // Dark Theme Colors (same structure, different values)
        'dark-bg': {
          primary: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
        },
        'dark-surface': {
          primary: '#1e293b',
          secondary: '#334155',
          tertiary: '#475569',
        },
        'dark-border': {
          primary: '#475569',
          secondary: '#64748b',
          tertiary: '#94a3b8',
        },
        'dark-text': {
          primary: '#f8fafc',
          secondary: '#cbd5e1',
          tertiary: '#94a3b8',
          inverse: '#0f172a',
        },
        'dark-interactive': {
          primary: '#60a5fa',
          secondary: '#93c5fd',
          hover: '#3b82f6',
          active: '#2563eb',
        },
        'dark-status': {
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
          info: '#60a5fa',
        },
        'dark-accent': {
          primary: '#60a5fa',
          secondary: '#93c5fd',
          muted: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
};
