import React, { useState } from 'react';
import { ErrorBoundary } from '../overlay/AppErrorBoundary';

interface SidebarStorageErrorBoundaryProps {
  children: React.ReactNode;
}

export const SidebarStorageErrorBoundary: React.FC<SidebarStorageErrorBoundaryProps> = ({
  children,
}) => {
  const [hasStorageError, setHasStorageError] = useState(false);

  if (hasStorageError) {
    return (
      <div className="storage-error-notification p-4 bg-red-50 border border-red-200 rounded text-red-700">
        <div className="error-content">
          <p className="mb-2">
            Unable to save sidebar preferences. Your changes may not persist between sessions.
          </p>
          <button
            onClick={() => setHasStorageError(false)}
            className="error-dismiss px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};
