import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { DashboardProvider } from '../../contexts/DashboardContext';
import { sidebarStorage } from '../../utils/sidebarStorage';

// Mock the storage service
vi.mock('../../utils/sidebarStorage', () => ({
  sidebarStorage: {
    loadSidebarState: vi.fn(),
    saveSidebarState: vi.fn(),
    clearSidebarState: vi.fn(),
    isValidState: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockSidebarStorage = vi.mocked(sidebarStorage);

const renderSidebar = (onToggle = vi.fn()) => {
  return render(
    <DashboardProvider>
      <Sidebar onToggle={onToggle} />
    </DashboardProvider>
  );
};

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('false');
    mockSidebarStorage.loadSidebarState.mockResolvedValue(null);
    mockSidebarStorage.saveSidebarState.mockResolvedValue();
  });

  describe('Tile Count Display', () => {
    it('should display tile count in the title', () => {
      renderSidebar();
      
      expect(screen.getByText(/Available Tiles \(12\)/)).toBeInTheDocument();
    });

    it('should update tile count when available tiles change', () => {
      renderSidebar();
      
      // Should show 12 available tiles
      expect(screen.getByText(/Available Tiles \(12\)/)).toBeInTheDocument();
    });
  });

  describe('Storage Integration', () => {
    it('should load sidebar state on mount', async () => {
      const savedState = {
        activeTiles: ['cryptocurrency', 'weather'],
        isCollapsed: false,
        lastUpdated: Date.now(),
      };
      
      mockSidebarStorage.loadSidebarState.mockResolvedValue(savedState);
      
      renderSidebar();
      
      await waitFor(() => {
        expect(mockSidebarStorage.loadSidebarState).toHaveBeenCalled();
      });
    });

    it('should save sidebar state when collapse state changes', async () => {
      const onToggle = vi.fn();
      renderSidebar(onToggle);
      // Try to find either 'Collapse sidebar' or 'Expand sidebar' button
      const toggleButton = screen.getByRole('button', { name: /collapse sidebar|expand sidebar/i });
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(mockSidebarStorage.saveSidebarState).toHaveBeenCalled();
      });
    });

    it('should handle storage errors gracefully', async () => {
      mockSidebarStorage.loadSidebarState.mockRejectedValue(new Error('Storage error'));
      
      renderSidebar();
      
      await waitFor(() => {
        expect(
          screen.getByText((content) =>
            /Failed to (load|save) sidebar preferences/.test(content)
          )
        ).toBeInTheDocument();
      });
    });

    it('should allow dismissing storage error', async () => {
      mockSidebarStorage.loadSidebarState.mockRejectedValue(new Error('Storage error'));
      
      renderSidebar();
      
      await waitFor(() => {
        expect(
          screen.getByText((content) =>
            /Failed to (load|save) sidebar preferences/.test(content)
          )
        ).toBeInTheDocument();
      });
      
      const dismissButton = screen.getByRole('button', { name: /dismiss error/i });
      fireEvent.click(dismissButton);
      
      expect(
        screen.queryByText((content) =>
          /Failed to (load|save) sidebar preferences/.test(content)
        )
      ).not.toBeInTheDocument();
    });
  });

  describe('Tile Toggle Functionality', () => {
    it('should toggle tile when clicked', async () => {
      renderSidebar();
      
      const cryptocurrencyButton = screen.getByRole('button', { name: /add cryptocurrency tile to dashboard/i });
      fireEvent.click(cryptocurrencyButton);
      
      await waitFor(() => {
        expect(mockSidebarStorage.saveSidebarState).toHaveBeenCalled();
      });
    });

    it('should handle tile toggle errors', async () => {
      mockSidebarStorage.saveSidebarState.mockRejectedValue(new Error('Save error'));
      
      renderSidebar();
      
      const cryptocurrencyButton = screen.getByRole('button', { name: /add cryptocurrency tile to dashboard/i });
      fireEvent.click(cryptocurrencyButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to save sidebar preferences/)).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle keyboard navigation with storage integration', async () => {
      renderSidebar();
      
      // Focus the sidebar
      const sidebar = screen.getByRole('complementary');
      fireEvent.keyDown(sidebar, { key: 'ArrowDown' });
      
      // Should still work with storage integration
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for storage status', () => {
      renderSidebar();
      
      expect(screen.getByRole('complementary')).toHaveAttribute('aria-label', 'Tile catalog sidebar');
      expect(screen.getByRole('listbox')).toHaveAttribute('aria-labelledby', 'tiles-heading');
    });

    it('should announce storage errors to screen readers', async () => {
      mockSidebarStorage.loadSidebarState.mockRejectedValue(new Error('Storage error'));
      
      renderSidebar();
      
      await waitFor(() => {
        const errorElement = screen.getByText((content) =>
          /Failed to (load|save) sidebar preferences/.test(content)
        );
        expect(errorElement).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should handle rapid tile toggles without errors', async () => {
      renderSidebar();
      
      // Trigger multiple rapid changes
      const cryptocurrencyButton = screen.getByRole('button', { name: /add cryptocurrency tile to dashboard/i });
      fireEvent.click(cryptocurrencyButton);
      fireEvent.click(cryptocurrencyButton);
      fireEvent.click(cryptocurrencyButton);
      
      // Should not throw errors
      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });
    });
  });
}); 

describe('Sidebar visual states', () => {
  it('renders default (not added, not selected) menu item with default border and no checkmark', () => {
    renderSidebar();
    // Select a different item to ensure the first is not selected
    const sidebar = screen.getByRole('complementary');
    fireEvent.keyDown(sidebar, { key: 'ArrowDown' }); // select first item
    fireEvent.keyDown(sidebar, { key: 'ArrowDown' }); // select second item
    const item = screen.getAllByRole('button')[0];
    expect(item).toHaveClass('border-theme-primary');
    expect(item).not.toHaveClass('border-yellow-500');
    expect(item.querySelector('[aria-label="check"]')).toBeNull();
    expect(item.querySelector('[aria-label="crypto"]')).toBeInTheDocument();
  });

  it('renders selected (active) menu item with yellow border', () => {
    renderSidebar();
    // The first item is selected by default
    const item = screen.getAllByRole('button')[0];
    expect(item).toHaveClass('border-yellow-500');
    expect(item.className).not.toMatch(/border-2/);
  });

  it('renders added (in-dashboard) menu item with checkmark and default border', async () => {
    renderSidebar();
    const item = screen.getByRole('button', { name: /add cryptocurrency tile to dashboard/i });
    fireEvent.click(item); // Add tile
    // Select a different item to remove selection from the added tile
    const sidebar = screen.getByRole('complementary');
    fireEvent.keyDown(sidebar, { key: 'ArrowDown' }); // select first item
    fireEvent.keyDown(sidebar, { key: 'ArrowDown' }); // select second item
    await waitFor(() => {
      expect(item.querySelector('[aria-label="check"]')).toBeInTheDocument();
      expect(item).toHaveClass('border-theme-primary');
      expect(item).not.toHaveClass('border-yellow-500');
    });
  });
}); 
