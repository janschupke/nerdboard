import { useEffect } from 'react';
import { Overlay } from './components/overlay/Overlay';
import { LogProvider } from './components/api-log/LogContext';
import { setupGlobalErrorHandling } from './services/apiErrorInterceptor';

function App() {
  useEffect(() => {
    // Set up global error handling to prevent console errors
    setupGlobalErrorHandling();
  }, []);

  return (
    <LogProvider>
      <div data-testid="app-root">
        <Overlay />
      </div>
    </LogProvider>
  );
}

export default App;
