export interface APILogEntry {
  id: string;
  timestamp: number;
  level: 'warning' | 'error';
  apiCall: string;
  reason: string;
  details?: Record<string, unknown>;
}

export interface LogStorageService {
  addLog(entry: Omit<APILogEntry, 'id' | 'timestamp'>): void;
  getLogs(): APILogEntry[];
  removeLog(id: string): void;
  clearLogs(): void;
  cleanupOldLogs(): void;
}

class APILogStorageService implements LogStorageService {
  private readonly STORAGE_KEY = 'nerdboard_api_logs';
  private readonly MAX_AGE_HOURS = 1;
  private readonly MAX_LOGS = 1000;

  addLog(entry: Omit<APILogEntry, 'id' | 'timestamp'>): void {
    try {
      const logs = this.getLogs();
      const newLog: APILogEntry = {
        ...entry,
        id: this.generateId(),
        timestamp: Date.now(),
      };
      
      logs.unshift(newLog);
      
      // Limit total number of logs
      if (logs.length > this.MAX_LOGS) {
        logs.splice(this.MAX_LOGS);
      }
      
      this.saveLogs(logs);
      this.cleanupOldLogs();
    } catch (error) {
      console.warn('Failed to add API log:', error);
    }
  }

  getLogs(): APILogEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Failed to retrieve API logs:', error);
      return [];
    }
  }

  removeLog(id: string): void {
    try {
      const logs = this.getLogs();
      const filteredLogs = logs.filter(log => log.id !== id);
      this.saveLogs(filteredLogs);
    } catch (error) {
      console.warn('Failed to remove API log:', error);
    }
  }

  clearLogs(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear API logs:', error);
    }
  }

  cleanupOldLogs(): void {
    try {
      const logs = this.getLogs();
      const cutoffTime = Date.now() - (this.MAX_AGE_HOURS * 60 * 60 * 1000);
      const filteredLogs = logs.filter(log => log.timestamp > cutoffTime);
      
      if (filteredLogs.length !== logs.length) {
        this.saveLogs(filteredLogs);
      }
    } catch (error) {
      console.warn('Failed to cleanup old API logs:', error);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveLogs(logs: APILogEntry[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
  }
}

export const logStorageService = new APILogStorageService(); 
