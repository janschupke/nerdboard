import { useEffect } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { LogProvider } from './contexts/LogContext';
import { setupGlobalErrorHandling } from './services/apiErrorInterceptor';

function App() {
  useEffect(() => {
    // Set up global error handling to prevent console errors
    setupGlobalErrorHandling();

    return () => {
      // No-op for deprecated storage cleanup
    };
  }, []);

  return (
    <LogProvider>
      <Dashboard />
    </LogProvider>
  );
}

export default App;
