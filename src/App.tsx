import { useEffect, useContext } from 'react';
import { Dashboard } from './components/overlay/Overlay';
import { LogProvider } from './components/api-log/LogContext';
import { setupGlobalErrorHandling } from './services/apiErrorInterceptor';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useLogManager } from './components/api-log/useLogManager';
import { DashboardContext } from './components/overlay/PageContext';

function AppContent() {
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
    <div data-testid="app-root">
      <Dashboard />
    </div>
  );
}

function App() {
  useEffect(() => {
    // Set up global error handling to prevent console errors
    setupGlobalErrorHandling();
  }, []);

  return (
    <LogProvider>
      <AppContent />
    </LogProvider>
  );
}

export default App;
