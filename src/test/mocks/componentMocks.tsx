import React from 'react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { AppTheme } from '../../services/storageManager';
import { DataServicesContext } from '../../contexts/DataServicesContext';
import { DataParserRegistry } from '../../services/dataParser';
import { DataMapperRegistry } from '../../services/dataMapper';
import { DataFetcher } from '../../services/dataFetcher';

export function createMockDataServices() {
  const parserRegistry = new DataParserRegistry();
  const mapperRegistry = new DataMapperRegistry();
  const dataFetcher = new DataFetcher(mapperRegistry, parserRegistry);
  return { parserRegistry, mapperRegistry, dataFetcher };
}

type MockDataServicesProviderProps = { children: ReactNode };
export const MockDataServicesProvider: React.FC<MockDataServicesProviderProps> = ({ children }) => {
  const services = createMockDataServices();
  return (
    <DataServicesContext.Provider value={services}>
      {children}
    </DataServicesContext.Provider>
  );
};

// Mock data arrays to capture props for testing
export const dragboardProviderProps: Array<Record<string, unknown>> = [];
export const headerMock = vi.fn();

// Reset mock data
export const resetComponentMocks = () => {
  dragboardProviderProps.length = 0;
  headerMock.mockClear();
};

// Dragboard component mocks
export const mockDragboardComponents = () => {
  vi.mock('../../components/dragboard', () => ({
    DragboardProvider: ({ children, ...props }: { children: React.ReactNode }) => {
      dragboardProviderProps.push(props);
      return React.createElement('div', { 'data-testid': 'mock-dragboard-provider' }, children);
    },
    DragboardGrid: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'mock-dragboard-grid' }, children),
    DragboardTile: ({
      children,
      id,
    }: {
      children: React.ReactNode;
      id: string;
      position: Record<string, unknown>;
      size: string;
    }) => React.createElement('div', { 'data-testid': `mock-dragboard-tile-${id}` }, children),
  }));
};

// Tile component mock
export const mockTileComponent = () => {
  vi.mock('../../components/tile/Tile', () => ({
    Tile: ({ tile }: { tile: Record<string, unknown> }) =>
      React.createElement('div', { 'data-testid': `mock-tile-${tile.id}` }, `MockTile ${tile.id}`),
  }));
};

// Header component mock
export const mockHeaderComponent = () => {
  vi.mock('../../components/header/Header', () => ({
    Header: (props: Record<string, unknown>) => {
      headerMock(props);
      return React.createElement('div', { 'data-testid': 'mock-header' }, [
        'MockHeader',
        React.createElement(
          'button',
          {
            'data-testid': 'toggle-sidebar',
            onClick: props.toggleCollapse as () => void,
          },
          'ToggleSidebar',
        ),
      ]);
    },
  }));
};

// LogView component mock
export const mockLogViewComponent = () => {
  vi.mock('../../components/api-log/LogView', () => ({
    LogView: () => React.createElement('div', { 'data-testid': 'mock-logview' }, 'MockLogView'),
  }));
};

// Mock the lazy import to prevent Suspense
export const mockLazyImports = () => {
  vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
      ...actual,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      lazy: (_importFn: () => Promise<unknown>) => {
        // Return a synchronous component instead of lazy
        return () =>
          React.createElement('div', { 'data-testid': 'mock-lazy-component' }, 'MockLazyComponent');
      },
    };
  });
};

// Hook mocks
export const mockHooks = () => {
  // Mock useTheme to prevent theme context issues
  vi.mock('../../hooks/useTheme', () => ({
    useTheme: () => ({
      theme: AppTheme.light,
      toggleTheme: vi.fn(),
      tokens: {},
    }),
  }));

  // Mock useLogManager to prevent log context issues
  vi.mock('../../components/api-log/useLogManager', () => ({
    useLogManager: () => ({
      isLogViewOpen: false,
      toggleLogView: vi.fn(),
      closeLogView: vi.fn(),
      hasLogs: false,
      errorCount: 0,
      warningCount: 0,
    }),
  }));

  // Mock useLogContext to prevent LogProvider errors
  vi.mock('../../components/api-log/useLogContext', () => ({
    useLogContext: () => ({
      logs: [],
      addLog: vi.fn(),
      removeLog: vi.fn(),
      clearLogs: vi.fn(),
      refreshLogs: vi.fn(),
    }),
  }));

  // Mock useKeyboardNavigation to prevent event listeners
  vi.mock('../../hooks/useKeyboardNavigation', () => ({
    useKeyboardNavigation: () => ({}),
  }));
};

// Setup all component mocks
export const setupComponentMocks = () => {
  mockDragboardComponents();
  mockTileComponent();
  mockHeaderComponent();
  mockLogViewComponent();
  mockLazyImports();
  mockHooks();
};
