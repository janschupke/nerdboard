import React from 'react';
import { StorageManagerContext, storageManager } from './storageManagerUtils';

export function StorageManagerProvider(props: { children: React.ReactNode }) {
  React.useEffect(() => {
    storageManager.init();
  }, []);

  return (
    <StorageManagerContext.Provider value={storageManager}>
      {props.children}
    </StorageManagerContext.Provider>
  );
}
