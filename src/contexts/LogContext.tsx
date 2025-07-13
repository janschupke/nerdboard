import React, { useState, useEffect, useCallback } from 'react';
import type { APILogEntry } from '../services/logStorageService';
import { logStorageService } from '../services/logStorageService';
import { LogContext } from './LogContextDef';

interface LogProviderProps {
  children: React.ReactNode;
}

export const LogProvider: React.FC<LogProviderProps> = ({ children }) => {
  const [logs, setLogs] = useState<APILogEntry[]>([]);

  const refreshLogs = useCallback(() => {
    const storedLogs = logStorageService.getLogs();
    setLogs(Array.isArray(storedLogs) ? storedLogs : []);
  }, []);

  const addLog = useCallback((entry: Omit<APILogEntry, 'id' | 'timestamp'>) => {
    logStorageService.addLog(entry);
    refreshLogs();
  }, [refreshLogs]);

  const removeLog = useCallback((id: string) => {
    logStorageService.removeLog(id);
    refreshLogs();
  }, [refreshLogs]);

  const clearLogs = useCallback(() => {
    logStorageService.clearLogs();
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

  return (
    <LogContext.Provider value={value}>
      {children}
    </LogContext.Provider>
  );
}; 
