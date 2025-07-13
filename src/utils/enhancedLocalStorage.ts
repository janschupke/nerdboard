import { getCachedData, setCachedData, clearExpiredData, getStorageUsage } from './localStorage';
import { STORAGE_KEYS } from './constants';

export interface StorageMetrics {
  used: number;
  available: number;
  percentage: number;
  tileCount: number;
  oldestData: Date | null;
  newestData: Date | null;
}

export interface SmartStorageConfig {
  maxStoragePercentage: number; // 80% of available storage
  maxTileDataAge: number; // 24 hours
  cleanupThreshold: number; // 70% triggers cleanup
  priorityTiles: string[]; // Tiles to preserve during cleanup
}

export const SMART_STORAGE_CONFIG: SmartStorageConfig = {
  maxStoragePercentage: 80,
  maxTileDataAge: 24 * 60 * 60 * 1000, // 24 hours
  cleanupThreshold: 70,
  priorityTiles: ['cryptocurrency', 'precious-metals', 'federal-funds-rate'],
};

export class SmartStorageManager {
  private static instance: SmartStorageManager;
  private cleanupInterval: NodeJS.Timeout | null = null;

  static getInstance(): SmartStorageManager {
    if (!SmartStorageManager.instance) {
      SmartStorageManager.instance = new SmartStorageManager();
    }
    return SmartStorageManager.instance;
  }

  async getData<T>(key: string, forceRefresh = false): Promise<T | null> {
    try {
      // Check if we need to force refresh based on data age
      if (!forceRefresh) {
        const cached = getCachedData<T>(key);
        if (cached) {
          // Check if data is stale and needs background refresh
          this.scheduleBackgroundRefresh(key);
          return cached;
        }
      }

      return null;
    } catch (error) {
      console.warn('Failed to get cached data:', error);
      return null;
    }
  }

  async setData<T>(key: string, data: T): Promise<void> {
    try {
      // Check storage usage before saving
      const metrics = this.getStorageMetrics();

      if (metrics.percentage > SMART_STORAGE_CONFIG.maxStoragePercentage) {
        await this.performEmergencyCleanup();
      } else if (metrics.percentage > SMART_STORAGE_CONFIG.cleanupThreshold) {
        await this.performPreventiveCleanup();
      }

      setCachedData(key, data);

      // Update storage metrics
      this.updateStorageMetrics();
    } catch (error) {
      console.warn('Failed to set cached data:', error);
    }
  }

  private scheduleBackgroundRefresh(key: string): void {
    // Schedule background refresh for stale data
    setTimeout(async () => {
      try {
        const cached = getCachedData(key);
        if (cached) {
          // Trigger background refresh without blocking UI
          this.performBackgroundRefresh(key);
        }
      } catch (error) {
        console.warn('Background refresh failed:', error);
      }
    }, 1000); // Small delay to avoid blocking initial load
  }

  private async performBackgroundRefresh(key: string): Promise<void> {
    // This will be implemented by individual tile services
    const event = new CustomEvent('background-refresh', { detail: { key } });
    window.dispatchEvent(event);
  }

  private async performEmergencyCleanup(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      const tileKeys = keys.filter((key) => key.startsWith(STORAGE_KEYS.TILE_DATA_PREFIX));

      // Sort by age and priority
      const sortedKeys = tileKeys.sort((a, b) => {
        const aData = getCachedData(a);
        const bData = getCachedData(b);

        if (!aData || !bData) return 0;

        // Priority tiles get higher score
        const aPriority = SMART_STORAGE_CONFIG.priorityTiles.some((tile) => a.includes(tile))
          ? 1
          : 0;
        const bPriority = SMART_STORAGE_CONFIG.priorityTiles.some((tile) => b.includes(tile))
          ? 1
          : 0;

        if (aPriority !== bPriority) return bPriority - aPriority;

        // Then sort by age (oldest first)
        return 0; // Placeholder for actual age comparison
      });

      // Remove oldest non-priority tiles first
      const keysToRemove = sortedKeys.slice(0, Math.floor(sortedKeys.length * 0.3));

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      console.log(`Emergency cleanup: removed ${keysToRemove.length} items`);
    } catch (error) {
      console.warn('Emergency cleanup failed:', error);
    }
  }

  private async performPreventiveCleanup(): Promise<void> {
    try {
      clearExpiredData();

      const metrics = this.getStorageMetrics();
      if (metrics.percentage > SMART_STORAGE_CONFIG.cleanupThreshold) {
        // Remove oldest 10% of data
        const keys = Object.keys(localStorage);
        const tileKeys = keys.filter((key) => key.startsWith(STORAGE_KEYS.TILE_DATA_PREFIX));

        const keysToRemove = tileKeys.slice(0, Math.floor(tileKeys.length * 0.1));
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        console.log(`Preventive cleanup: removed ${keysToRemove.length} items`);
      }
    } catch (error) {
      console.warn('Preventive cleanup failed:', error);
    }
  }

  getStorageMetrics(): StorageMetrics {
    const usage = getStorageUsage();
    const keys = Object.keys(localStorage);
    const tileKeys = keys.filter((key) => key.startsWith(STORAGE_KEYS.TILE_DATA_PREFIX));

    let oldestData: Date | null = null;
    let newestData: Date | null = null;

    tileKeys.forEach((key) => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const timestamp = new Date(parsed.timestamp);

          if (!oldestData || timestamp < oldestData) {
            oldestData = timestamp;
          }
          if (!newestData || timestamp > newestData) {
            newestData = timestamp;
          }
        }
      } catch (error) {
        console.warn('Failed to parse storage item:', error);
      }
    });

    return {
      used: usage.used,
      available: usage.available,
      percentage: (usage.used / (usage.used + usage.available)) * 100,
      tileCount: tileKeys.length,
      oldestData,
      newestData,
    };
  }

  private updateStorageMetrics(): void {
    // Update metrics for monitoring
    const metrics = this.getStorageMetrics();

    if (metrics.percentage > SMART_STORAGE_CONFIG.maxStoragePercentage) {
      console.warn('Storage usage exceeded limit:', metrics.percentage.toFixed(2) + '%');
    }
  }

  startMonitoring(): void {
    // Set up periodic cleanup
    this.cleanupInterval = setInterval(
      () => {
        this.performPreventiveCleanup();
      },
      30 * 60 * 1000,
    ); // Every 30 minutes
  }

  stopMonitoring(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export const smartStorage = SmartStorageManager.getInstance();
