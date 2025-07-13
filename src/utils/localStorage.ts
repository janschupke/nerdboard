// Local storage utilities for tile data management
export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface LocalStorageConfig {
  maxAge: number; // 10 minutes in milliseconds
  cleanupInterval: number; // 1 hour in milliseconds
}

export const STORAGE_CONFIG: LocalStorageConfig = {
  maxAge: 10 * 60 * 1000, // 10 minutes
  cleanupInterval: 60 * 60 * 1000, // 1 hour
};

export const getCachedData = <T>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const cached: CachedData<T> = JSON.parse(stored);
    const now = Date.now();

    if (now > cached.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    // Reconstruct Date objects in the data
    const reconstructedData = reconstructDates(cached.data);
    return reconstructedData as T;
  } catch (error) {
    console.warn('Failed to retrieve cached data:', error);
    return null;
  }
};

// Helper function to recursively reconstruct Date objects
function reconstructDates(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Check if this string looks like a date
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }

  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(reconstructDates);
    }

    const reconstructed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      reconstructed[key] = reconstructDates(value);
    }
    return reconstructed;
  }

  return obj;
}

export const setCachedData = <T>(key: string, data: T): void => {
  try {
    const now = Date.now();
    const cached: CachedData<T> = {
      data,
      timestamp: now,
      expiresAt: now + STORAGE_CONFIG.maxAge,
    };

    localStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
};

export const clearExpiredData = (): void => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach((key) => {
      if (key.startsWith('tile-data-')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const cached = JSON.parse(stored);
          if (now > cached.expiresAt) {
            localStorage.removeItem(key);
          }
        }
      }
    });
  } catch (error) {
    console.warn('Failed to clear expired data:', error);
  }
};

export const getStorageUsage = (): { used: number; available: number } => {
  try {
    let used = 0;
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        used += new Blob([item]).size;
      }
    });

    // Estimate available storage (5MB is a safe default)
    const available = 5 * 1024 * 1024 - used;

    return { used, available };
  } catch (error) {
    console.warn('Failed to calculate storage usage:', error);
    return { used: 0, available: 0 };
  }
};
