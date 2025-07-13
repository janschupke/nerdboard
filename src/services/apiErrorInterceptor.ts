import { logStorageService } from './logStorageService';

export interface APIError {
  apiCall: string;
  reason: string;
  details?: Record<string, unknown>;
}

export const interceptAPIError = (error: APIError): void => {
  // Prevent error from appearing in console
  const originalConsoleError = console.error;
  console.error = () => {}; // Temporarily suppress console.error
  
  // Log the error to our storage system
  logStorageService.addLog({
    level: 'error',
    apiCall: error.apiCall,
    reason: error.reason,
    details: error.details,
  });
  
  // Restore console.error
  console.error = originalConsoleError;
};

export const interceptAPIWarning = (warning: APIError): void => {
  // Prevent warning from appearing in console
  const originalConsoleWarn = console.warn;
  console.warn = () => {}; // Temporarily suppress console.warn
  
  // Log the warning to our storage system
  logStorageService.addLog({
    level: 'warning',
    apiCall: warning.apiCall,
    reason: warning.reason,
    details: warning.details,
  });
  
  // Restore console.warn
  console.warn = originalConsoleWarn;
}; 
