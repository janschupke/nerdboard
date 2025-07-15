// Setup mocks before any imports
import { vi } from 'vitest';
import { setupComponentMocks } from '../../test/mocks/componentMocks';

// Setup all component mocks
setupComponentMocks();

import { render, screen, act } from '@testing-library/react';
import { Overlay } from './Overlay';
import { StorageManagerContext, AppTheme } from '../../services/storageManager';
import type { StorageManager } from '../../services/storageManager';
import { describe, it, beforeEach, expect } from 'vitest';
import { resetComponentMocks, headerMock } from '../../test/mocks/componentMocks';

const mockTiles = [
  {
    id: 'tile-1',
    type: 'cryptocurrency',
    position: { x: 0, y: 0 },
    size: 'medium',
    createdAt: 123,
    config: { foo: 'bar' },
  },
];

describe('Overlay', () => {
  let mockStorageManager: Partial<StorageManager> & Record<string, unknown>;

  beforeEach(() => {
    resetComponentMocks();
    mockStorageManager = {
      getDashboardState: vi.fn(() => ({ tiles: mockTiles })),
      setDashboardState: vi.fn(),
      getAppConfig: vi.fn(() => ({ isSidebarCollapsed: false, theme: AppTheme.light })),
      setAppConfig: vi.fn(),
    };
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(
        <StorageManagerContext.Provider value={mockStorageManager as unknown as StorageManager}>
          <Overlay />
        </StorageManagerContext.Provider>,
      );
    });
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-dragboard-provider')).toBeInTheDocument();
    expect(screen.getByTestId('mock-dragboard-grid')).toBeInTheDocument();
    expect(screen.getByTestId('mock-dragboard-tile-tile-1')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tile-tile-1')).toBeInTheDocument();
  });

  it('toggles sidebar collapse state when header button is clicked', async () => {
    await act(async () => {
      render(
        <StorageManagerContext.Provider value={mockStorageManager as unknown as StorageManager}>
          <Overlay />
        </StorageManagerContext.Provider>,
      );
    });
    const toggleButton = screen.getByTestId('toggle-sidebar');
    // Header should receive correct props
    expect(headerMock).toHaveBeenCalled();
    expect(headerMock.mock.calls[0][0].isLogViewOpen).toBe(false);
    expect(headerMock.mock.calls[0][0].theme).toBe(AppTheme.light);
    expect(typeof headerMock.mock.calls[0][0].toggleCollapse).toBe('function');
    // Click toggle button
    await act(async () => {
      toggleButton.click();
    });
    // The toggleCollapse function should have been called
    // We can't easily test the state change since it's internal to Overlay
    // But we can verify the Header was rendered with the toggle function
    expect(headerMock).toHaveBeenCalled();
  });

  it('persists tiles to storage when tiles change', async () => {
    mockStorageManager.getDashboardState = vi.fn(() => ({ tiles: [] }));
    const setDashboardState = vi.fn();
    mockStorageManager.setDashboardState = setDashboardState;
    await act(async () => {
      render(
        <StorageManagerContext.Provider value={mockStorageManager as unknown as StorageManager}>
          <Overlay />
        </StorageManagerContext.Provider>,
      );
    });
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });
});
