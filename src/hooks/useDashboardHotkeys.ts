import { useEffect } from 'react';

interface DashboardHotkeysProps {
  toggleLogView: () => void;
  refreshAllTiles: () => void;
  isRefreshing: boolean;
}

export function useDashboardHotkeys({ toggleLogView, refreshAllTiles, isRefreshing }: DashboardHotkeysProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'l' || event.key === 'L') {
        event.preventDefault();
        toggleLogView();
      }
      if ((event.key === 'r' || event.key === 'R') && !isRefreshing) {
        event.preventDefault();
        refreshAllTiles();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLogView, refreshAllTiles, isRefreshing]);
} 
