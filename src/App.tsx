import { useEffect, useContext } from 'react';
import { Dashboard } from './components/overlay/Page';
import { LogProvider } from './components/api-log/LogContext';
import { setupGlobalErrorHandling } from './services/apiErrorInterceptor';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useLogManager } from './components/api-log/useLogManager';
import { DashboardContext } from './components/overlay/PageContext';

function App() {
  useEffect(() => {
    // Set up global error handling to prevent console errors
    setupGlobalErrorHandling();
  }, []);

  // Get log and refresh handlers from context/hooks
  const { toggleLogView } = useLogManager();
  const dashboardContext = useContext(DashboardContext);
  const refreshAllTiles = dashboardContext?.refreshAllTiles;
  const isRefreshing = dashboardContext?.isRefreshing;

  // Use unified keyboard navigation for global hotkeys (L, R)
  useKeyboardNavigation({
    toggleLogView,
    refreshAllTiles,
    isRefreshing,
  });

  return (
    <LogProvider>
      <div data-testid="app-root">
        <Dashboard />
      </div>
    </LogProvider>
  );
}

export default App;
