export interface SidebarState {
  activeTiles: string[];
  isCollapsed: boolean;
  lastUpdated: number;
}

export interface SidebarStorageService {
  saveSidebarState: (state: SidebarState) => Promise<void>;
  loadSidebarState: () => Promise<SidebarState | null>;
  clearSidebarState: () => Promise<void>;
  isValidState: (state: unknown) => state is SidebarState;
}

class SidebarStorageServiceImpl implements SidebarStorageService {
  private readonly STORAGE_KEY = 'nerdboard-sidebar-state';
  private readonly MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  async saveSidebarState(state: SidebarState): Promise<void> {
    try {
      const dataToSave = {
        ...state,
        lastUpdated: Date.now(),
      };
      
      const serialized = JSON.stringify(dataToSave);
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
      throw new Error('Failed to save sidebar preferences');
    }
  }

  async loadSidebarState(): Promise<SidebarState | null> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      
      if (!this.isValidState(parsed)) {
        console.warn('Invalid sidebar state found, clearing...');
        await this.clearSidebarState();
        return null;
      }

      // Check if data is too old
      if (Date.now() - parsed.lastUpdated > this.MAX_AGE_MS) {
        console.warn('Sidebar state is too old, clearing...');
        await this.clearSidebarState();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Failed to load sidebar state:', error);
      return null;
    }
  }

  async clearSidebarState(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear sidebar state:', error);
    }
  }

  isValidState(state: unknown): state is SidebarState {
    if (!state || typeof state !== 'object' || state === null) {
      return false;
    }

    const stateObj = state as Record<string, unknown>;
    
    return (
      'activeTiles' in stateObj &&
      'isCollapsed' in stateObj &&
      'lastUpdated' in stateObj &&
      Array.isArray(stateObj.activeTiles) &&
      stateObj.activeTiles.every((tile: unknown) => typeof tile === 'string') &&
      typeof stateObj.isCollapsed === 'boolean' &&
      typeof stateObj.lastUpdated === 'number'
    );
  }
}

export const sidebarStorage = new SidebarStorageServiceImpl(); 
