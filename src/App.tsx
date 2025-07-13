import { useEffect } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { clearExpiredData } from './utils/localStorage';

function App() {
  useEffect(() => {
    // Clean up expired data on app start
    clearExpiredData();

    // Set up periodic cleanup
    const cleanupInterval = setInterval(clearExpiredData, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(cleanupInterval);
  }, []);

  return <Dashboard />;
}

export default App;
