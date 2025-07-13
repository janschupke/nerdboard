import { useEffect } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { clearExpiredData } from './utils/localStorage';
import { smartStorage } from './utils/enhancedLocalStorage';
import { offlineSupport } from './utils/offlineSupport';

function App() {
  useEffect(() => {
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

  return <Dashboard />;
}

export default App;
