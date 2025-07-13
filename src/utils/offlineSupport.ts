import { smartStorage } from './enhancedLocalStorage';
import type { StorageMetrics } from './enhancedLocalStorage';

export interface OfflineStatus {
  isOnline: boolean;
  lastOnlineCheck: Date;
  cachedDataAvailable: boolean;
  storageMetrics: StorageMetrics | null;
}

export class OfflineSupport {
  private static instance: OfflineSupport;
  private onlineStatus: OfflineStatus = {
    isOnline: navigator.onLine,
    lastOnlineCheck: new Date(),
    cachedDataAvailable: false,
    storageMetrics: null,
  };

  static getInstance(): OfflineSupport {
    if (!OfflineSupport.instance) {
      OfflineSupport.instance = new OfflineSupport();
    }
    return OfflineSupport.instance;
  }

  initialize(): void {
    // Monitor online/offline status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Check cached data availability
    this.checkCachedDataAvailability();

    // Update status periodically
    setInterval(() => {
      this.updateStatus();
    }, 30000); // Every 30 seconds
  }

  private handleOnline(): void {
    this.onlineStatus.isOnline = true;
    this.onlineStatus.lastOnlineCheck = new Date();

    // Trigger background refresh when coming back online
    setTimeout(() => {
      const event = new CustomEvent('online-restored');
      window.dispatchEvent(event);
    }, 1000);
  }

  private handleOffline(): void {
    this.onlineStatus.isOnline = false;
    this.onlineStatus.lastOnlineCheck = new Date();

    console.log('App is now offline, using cached data');
  }

  private checkCachedDataAvailability(): void {
    const metrics = smartStorage.getStorageMetrics();
    this.onlineStatus.cachedDataAvailable = metrics.tileCount > 0;
    this.onlineStatus.storageMetrics = metrics;
  }

  private updateStatus(): void {
    this.onlineStatus.isOnline = navigator.onLine;
    this.onlineStatus.lastOnlineCheck = new Date();
    this.checkCachedDataAvailability();
  }

  getStatus(): OfflineStatus {
    return { ...this.onlineStatus };
  }

  isOffline(): boolean {
    return !this.onlineStatus.isOnline;
  }

  hasCachedData(): boolean {
    return this.onlineStatus.cachedDataAvailable;
  }
}

export const offlineSupport = OfflineSupport.getInstance();
