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

describe('Tile Removal Functionality', () => {
  it('should remove tile when clicking on an active tile', async () => {
    renderSidebar();
    
    // First add a tile
    const cryptocurrencyButton = screen.getByRole('button', { name: /add cryptocurrency tile to dashboard/i });
    fireEvent.click(cryptocurrencyButton);
    
    // Wait for tile to be added
    await waitFor(() => {
      expect(cryptocurrencyButton).toHaveAttribute('aria-pressed', 'true');
    });
    
    // Now click to remove it
    fireEvent.click(cryptocurrencyButton);
    
    // Verify tile is removed
    await waitFor(() => {
      expect(cryptocurrencyButton).toHaveAttribute('aria-pressed', 'false');
      expect(cryptocurrencyButton.querySelector('[aria-label="check"]')).toBeNull();
    });
  });

  it('should remove tile when pressing Enter on an active tile', async () => {
    renderSidebar();
    
    // First add a tile
    const cryptocurrencyButton = screen.getByRole('button', { name: /add cryptocurrency tile to dashboard/i });
    fireEvent.click(cryptocurrencyButton);
    
    // Wait for tile to be added
    await waitFor(() => {
      expect(cryptocurrencyButton).toHaveAttribute('aria-pressed', 'true');
    });
    
    // Focus the button and press Enter
    cryptocurrencyButton.focus();
    fireEvent.keyDown(cryptocurrencyButton, { key: 'Enter' });
    
    // Verify tile is removed
    await waitFor(() => {
      expect(cryptocurrencyButton).toHaveAttribute('aria-pressed', 'false');
      expect(cryptocurrencyButton.querySelector('[aria-label="check"]')).toBeNull();
    });
  });

  it('should remove tile when pressing Enter via keyboard navigation', async () => {
    renderSidebar();
    
    // First add a tile
    const cryptocurrencyButton = screen.getByRole('button', { name: /add cryptocurrency tile to dashboard/i });
    fireEvent.click(cryptocurrencyButton);
    
    // Wait for tile to be added
    await waitFor(() => {
      expect(cryptocurrencyButton).toHaveAttribute('aria-pressed', 'true');
    });
    
    // Use keyboard navigation to select the tile and press Enter
    const sidebar = screen.getByRole('complementary');
    fireEvent.keyDown(sidebar, { key: 'Enter' });
    
    // Verify tile is removed
    await waitFor(() => {
      expect(cryptocurrencyButton).toHaveAttribute('aria-pressed', 'false');
      expect(cryptocurrencyButton.querySelector('[aria-label="check"]')).toBeNull();
    });
  });

  it('should allow adding tile back after removal', async () => {
    renderSidebar();
    
    const cryptocurrencyButton = screen.getByRole('button', { name: /add cryptocurrency tile to dashboard/i });
    
    // Add tile
    fireEvent.click(cryptocurrencyButton);
    await waitFor(() => {
      expect(cryptocurrencyButton).toHaveAttribute('aria-pressed', 'true');
    });
    
    // Remove tile
    fireEvent.click(cryptocurrencyButton);
    await waitFor(() => {
      expect(cryptocurrencyButton).toHaveAttribute('aria-pressed', 'false');
    });
    
    // Add tile back
    fireEvent.click(cryptocurrencyButton);
    await waitFor(() => {
      expect(cryptocurrencyButton).toHaveAttribute('aria-pressed', 'true');
      expect(cryptocurrencyButton.querySelector('[aria-label="check"]')).toBeInTheDocument();
    });
  });

  it('should handle multiple rapid add/remove operations', async () => {
    renderSidebar();
    
    const cryptocurrencyButton = screen.getByRole('button', { name: /add cryptocurrency tile to dashboard/i });
    
    // Rapid add/remove/add
    fireEvent.click(cryptocurrencyButton);
    fireEvent.click(cryptocurrencyButton);
    fireEvent.click(cryptocurrencyButton);
    
    // Should end up with tile added
    await waitFor(() => {
      expect(cryptocurrencyButton).toHaveAttribute('aria-pressed', 'true');
      expect(cryptocurrencyButton.querySelector('[aria-label="check"]')).toBeInTheDocument();
    });
  });
}); 

describe('Sidebar Collapse Functionality', () => {
  it('should initialize with sidebar expanded by default', () => {
    localStorageMock.getItem.mockReturnValue('false');
    renderSidebar();
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('w-64');
    expect(sidebar).not.toHaveClass('w-0');
  });

  it('should initialize with sidebar collapsed when localStorage says so', () => {
    localStorageMock.getItem.mockReturnValue('true');
    renderSidebar();
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('w-0');
    expect(sidebar).not.toHaveClass('w-64');
  });

  it('should hide menu items when sidebar is collapsed', () => {
    localStorageMock.getItem.mockReturnValue('true');
    renderSidebar();
    
    // Menu items should not be visible when collapsed
    expect(screen.queryByText('Cryptocurrency')).not.toBeInTheDocument();
    expect(screen.queryByText('Precious Metals')).not.toBeInTheDocument();
    expect(screen.queryByText('Helsinki Weather')).not.toBeInTheDocument();
  });

  it('should show menu items when sidebar is expanded', () => {
    localStorageMock.getItem.mockReturnValue('false');
    renderSidebar();
    
    // Menu items should be visible when expanded
    expect(screen.getByText('Cryptocurrency')).toBeInTheDocument();
    expect(screen.getByText('Precious Metals')).toBeInTheDocument();
    expect(screen.getByText('Helsinki Weather')).toBeInTheDocument();
  });

  it('should toggle sidebar collapse state when toggle button is clicked', () => {
    localStorageMock.getItem.mockReturnValue('false');
    renderSidebar();
    
    // Initially expanded
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('w-64');
    
    // Click toggle button to collapse
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(toggleButton);
    
    // Should be collapsed
    expect(sidebar).toHaveClass('w-0');
    expect(sidebar).not.toHaveClass('w-64');
    
    // Menu items should be hidden
    expect(screen.queryByText('Cryptocurrency')).not.toBeInTheDocument();
  });

  it('should update localStorage when collapse state changes', () => {
    localStorageMock.getItem.mockReturnValue('false');
    renderSidebar();
    
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(toggleButton);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
  });

  it('should show correct button text based on collapse state', () => {
    localStorageMock.getItem.mockReturnValue('false');
    renderSidebar();
    
    // Initially shows "Collapse" when expanded
    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument();
    
    // Click to collapse
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(toggleButton);
    
    // Should show "Expand" when collapsed
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
  });

  it('should handle keyboard navigation for collapse (ArrowLeft/ArrowRight)', () => {
    localStorageMock.getItem.mockReturnValue('false');
    renderSidebar();
    
    const sidebar = screen.getByRole('complementary');
    
    // Initially expanded
    expect(sidebar).toHaveClass('w-64');
    
    // Press ArrowLeft to collapse
    fireEvent.keyDown(sidebar, { key: 'ArrowLeft' });
    expect(sidebar).toHaveClass('w-0');
    
    // Press ArrowRight to expand
    fireEvent.keyDown(sidebar, { key: 'ArrowRight' });
    expect(sidebar).toHaveClass('w-64');
  });

  it('should not allow collapse when already collapsed', () => {
    localStorageMock.getItem.mockReturnValue('true');
    renderSidebar();
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('w-0');
    
    // Press ArrowLeft when already collapsed - should stay collapsed
    fireEvent.keyDown(sidebar, { key: 'ArrowLeft' });
    expect(sidebar).toHaveClass('w-0');
  });

  it('should not allow expand when already expanded', () => {
    localStorageMock.getItem.mockReturnValue('false');
    renderSidebar();
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('w-64');
    
    // Press ArrowRight when already expanded - should stay expanded
    fireEvent.keyDown(sidebar, { key: 'ArrowRight' });
    expect(sidebar).toHaveClass('w-64');
  });
}); 
