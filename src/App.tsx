import { useEffect } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { clearExpiredData } from './utils/localStorage';
import { smartStorage } from './utils/enhancedLocalStorage';
import { offlineSupport } from './utils/offlineSupport';
import { LogProvider } from './contexts/LogContext';
import { setupGlobalErrorHandling } from './services/apiErrorInterceptor';

function App() {
  useEffect(() => {
    // Set up global error handling to prevent console errors
    setupGlobalErrorHandling();

    // Initialize smart storage monitoring
    smartStorage.startMonitoring();

    // Initialize offline support
    offlineSupport.initialize();

    // Clean up expired data on app start
    clearExpiredData();

    return () => {
      smartStorage.stopMonitoring();
    };
  }, []);

  return (
    <LogProvider>
      <Dashboard />
    </LogProvider>
  );
}

export default App;
