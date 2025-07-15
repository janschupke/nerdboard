import React, { useState, useEffect, useCallback } from 'react';
import type { APILogEntry } from '../../services/storageManager';
import { storageManager } from '../../services/storageManager';
import { LogContext } from './LogContextDef';

interface LogProviderProps {
  children: React.ReactNode;
}

export const LogProvider: React.FC<LogProviderProps> = ({ children }) => {
  const [logs, setLogs] = useState<APILogEntry[]>([]);

  const refreshLogs = useCallback(() => {
    const storedLogs = storageManager.getLogs();
    setLogs(Array.isArray(storedLogs) ? storedLogs : []);
  }, []);

  const addLog = useCallback(
    (entry: Omit<APILogEntry, 'id' | 'timestamp'>) => {
      storageManager.addLog(entry);
      refreshLogs();
    },
    [refreshLogs],
  );

  const removeLog = useCallback(
    (id: string) => {
      const logs = storageManager.getLogs().filter((log) => log.id !== id);
      storageManager.clearLogs();
      logs.forEach((log) =>
        storageManager.addLog({
          level: log.level,
          apiCall: log.apiCall,
          reason: log.reason,
          details: log.details,
        }),
      );
      refreshLogs();
    },
    [refreshLogs],
  );

  const clearLogs = useCallback(() => {
    storageManager.clearLogs();
    refreshLogs();
  }, [refreshLogs]);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  const value = {
    logs,
    addLog,
    removeLog,
    clearLogs,
    refreshLogs,
  };

  return <LogContext.Provider value={value}>{children}</LogContext.Provider>;
};
