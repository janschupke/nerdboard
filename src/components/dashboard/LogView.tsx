import React, { useEffect, useCallback } from 'react';
import { Icon } from '../ui/Icon';
import { useLogContext } from '../../hooks/useLogContext';
import type { APILogEntry } from '../../services/logStorageService';

interface LogViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogView: React.FC<LogViewProps> = ({ isOpen, onClose }) => {
  const { logs, removeLog } = useLogContext();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLevelColor = (level: 'warning' | 'error'): string => {
    return level === 'error' 
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const getLevelIcon = (level: 'warning' | 'error'): string => {
    return level === 'error' ? 'exclamation-triangle' : 'exclamation-circle';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Log View Container */}
      <div className="relative w-full max-w-6xl mx-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Icon name="clipboard-list" className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              API Logs
            </h2>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                <Icon name="exclamation-triangle" className="w-3 h-3" />
                {logs.filter(log => log.level === 'error').length} Errors
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                <Icon name="exclamation-circle" className="w-3 h-3" />
                {logs.filter(log => log.level === 'warning').length} Warnings
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close log view"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Log Table */}
        <div className="max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <Icon name="check-circle" className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">No API logs</p>
              <p className="text-sm">All API calls are working correctly</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    API Call
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <LogRow 
                    key={log.id} 
                    log={log} 
                    onRemove={() => removeLog(log.id)}
                    formatTimestamp={formatTimestamp}
                    getLevelColor={getLevelColor}
                    getLevelIcon={getLevelIcon}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Logs older than 1 hour are automatically removed
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Icon name="information-circle" className="w-4 h-4" />
            Press ESC to close
          </div>
        </div>
      </div>
    </div>
  );
};

interface LogRowProps {
  log: APILogEntry;
  onRemove: () => void;
  formatTimestamp: (timestamp: number) => string;
  getLevelColor: (level: 'warning' | 'error') => string;
  getLevelIcon: (level: 'warning' | 'error') => string;
}

const LogRow: React.FC<LogRowProps> = ({ 
  log, 
  onRemove, 
  formatTimestamp, 
  getLevelColor, 
  getLevelIcon 
}) => {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getLevelColor(log.level)}`}>
          <Icon name={getLevelIcon(log.level)} className="w-3 h-3" />
          {log.level}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
        {formatTimestamp(log.timestamp)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">
        {log.apiCall}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
        {log.reason}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={`Remove log entry for ${log.apiCall}`}
        >
          <Icon name="trash" className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}; 
