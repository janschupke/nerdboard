import { useEffect } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { LogProvider } from './components/dashboard/log/LogContext';
import { setupGlobalErrorHandling } from './services/apiErrorInterceptor';

function App() {
  useEffect(() => {
    // Set up global error handling to prevent console errors
    setupGlobalErrorHandling();
  }, []);

  return (
    <LogProvider>
      <div data-testid="app-root">
        <Dashboard />
      </div>
    </LogProvider>
  );
}

export default App;
