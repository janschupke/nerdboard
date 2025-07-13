import { useState, useEffect, useCallback, useMemo } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Memoize the key to prevent unnecessary re-renders
  const memoizedKey = useMemo(() => key, [key]);

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(memoizedKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${memoizedKey}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(memoizedKey, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${memoizedKey}":`, error);
      }
    },
    [memoizedKey, storedValue],
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === memoizedKey && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${memoizedKey}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [memoizedKey]);

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(() => [storedValue, setValue] as const, [storedValue, setValue]);
}
