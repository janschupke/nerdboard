import React, { useState, useEffect } from 'react';

export const StorageStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="storage-status offline p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
        <span className="status-icon mr-1">⚠️</span>
        <span className="status-text">Offline - changes may not save</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="storage-status saved p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
        <span className="status-icon mr-1">✓</span>
        <span className="status-text">Saved</span>
      </div>
    );
  }

  return null;
};
