import { useState, useCallback } from 'react';
import type { DashboardContextType, DashboardTile } from '../types/dashboard';
import { useLocalStorage } from './useLocalStorage';

const DASHBOARD_STORAGE_KEY = 'nerdboard-dashboard-layout';

export const useDashboard = (): DashboardContextType => {
  const [layout, setLayout] = useLocalStorage<DashboardTile[]>(DASHBOARD_STORAGE_KEY, []);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const addTile = useCallback(
    (tile: DashboardTile | string) => {
      if (typeof tile === 'string') {
        const newTile: DashboardTile = {
          id: Math.random().toString(36).substr(2, 9),
          type: tile as DashboardTile['type'],
          position: { x: 0, y: 0 },
          size: 'medium',
          config: {},
        };
        setLayout((prev) => [...prev, newTile]);
      } else {
        setLayout((prev) => [...prev, tile]);
      }
    },
    [setLayout],
  );

  const removeTile = useCallback(
    (id: string) => {
      setLayout((prev) => prev.filter((tile) => tile.id !== id));
    },
    [setLayout],
  );

  const updateTile = useCallback(
    (id: string, updates: Partial<DashboardTile>) => {
      setLayout((prev) => prev.map((tile) => (tile.id === id ? { ...tile, ...updates } : tile)));
    },
    [setLayout],
  );

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const setThemeMode = useCallback((newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  }, []);

  return {
    layout: {
      tiles: layout,
      isCollapsed,
      theme,
    },
    addTile,
    removeTile,
    updateTile,
    toggleCollapse,
    setTheme: setThemeMode,
  };
};
