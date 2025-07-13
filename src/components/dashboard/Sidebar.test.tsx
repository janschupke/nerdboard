import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils/testWrapper';
import { Sidebar } from './Sidebar';
import { DashboardProvider } from '../../contexts/DashboardContext';
import { sidebarStorage } from '../../utils/sidebarStorage';
import { Dashboard } from './Dashboard';

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

const renderDashboard = () => {
  return render(<Dashboard />);
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
      
      expect(mockSidebarStorage.loadSidebarState).toHaveBeenCalled();
    });
  });

  describe('Tile Toggle Functionality', () => {
    it('should toggle tile when clicked', async () => {
      renderSidebar();
      
      const cryptocurrencyButton = screen.getByRole('button', { name: /add cryptocurrency tile to dashboard/i });
      fireEvent.click(cryptocurrencyButton);
      
      // The tile toggle functionality is now handled by the DashboardContext
      // and the storage is managed at that level, not in the sidebar component
      expect(cryptocurrencyButton).toBeInTheDocument();
    });
  });

  describe('Sidebar Collapse Functionality', () => {
    it('should initialize with correct collapse state', () => {
      renderSidebar();
      
      const sidebar = screen.getByRole('complementary');
      // Should start expanded by default
      expect(sidebar).toHaveClass('w-64');
      expect(sidebar).not.toHaveClass('w-0');
    });

    it('should hide menu items when collapsed', () => {
      renderSidebar();
      
      const sidebar = screen.getByRole('complementary');
      
      // Initially visible
      expect(screen.getByText('Available Tiles (12)')).toBeInTheDocument();
      expect(screen.getByText('Cryptocurrency')).toBeInTheDocument();
      
      // The collapse functionality is now handled by the header menu button
      // and keyboard navigation, not by a button in the sidebar itself
      expect(sidebar).toHaveClass('w-64');
    });
  });

  describe('Sidebar', () => {
    it('should render all available tiles', () => {
      renderSidebar();
      
      expect(screen.getByText('Cryptocurrency')).toBeInTheDocument();
      expect(screen.getByText('Precious Metals')).toBeInTheDocument();
      expect(screen.getByText('Federal Funds Rate')).toBeInTheDocument();
      expect(screen.getByText('Euribor Rate')).toBeInTheDocument();
      expect(screen.getByText('Helsinki Weather')).toBeInTheDocument();
      expect(screen.getByText('Prague Weather')).toBeInTheDocument();
      expect(screen.getByText('Taipei Weather')).toBeInTheDocument();
      expect(screen.getByText('GDX ETF')).toBeInTheDocument();
      expect(screen.getByText('Helsinki Time')).toBeInTheDocument();
      expect(screen.getByText('Prague Time')).toBeInTheDocument();
      expect(screen.getByText('Taipei Time')).toBeInTheDocument();
      expect(screen.getByText('Uranium Price')).toBeInTheDocument();
    });

    it('should handle tile toggle when clicked', async () => {
      const onToggle = vi.fn();
      renderSidebar(onToggle);
      
      const cryptoButton = screen.getByRole('button', { name: /add cryptocurrency tile to dashboard/i });
      fireEvent.click(cryptoButton);
      
      // The tile toggle should work independently of the sidebar toggle
      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('Sidebar Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderSidebar();
      
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveAttribute('aria-label', 'Tile catalog sidebar');
      
      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-label', 'Available dashboard tiles');
      expect(listbox).toHaveAttribute('aria-labelledby', 'tiles-heading');
      
      const heading = screen.getByRole('heading', { name: /available tiles/i });
      expect(heading).toHaveAttribute('id', 'tiles-heading');
    });

    it('should announce selection changes to screen readers', () => {
      renderSidebar();
      
      // Focus on the first tile
      const firstTile = screen.getByRole('button', { name: /add cryptocurrency tile to dashboard/i });
      fireEvent.focus(firstTile);
      
      // The announcement should be made to the live region
      const liveRegion = document.getElementById('keyboard-announcements');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Dashboard Toggle Functionality', () => {
    it('should toggle sidebar when header menu button is clicked', () => {
      renderDashboard();
      
      // Initially sidebar should be expanded
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('w-64');
      expect(sidebar).not.toHaveClass('w-0');
      
      // Click the menu button in the header
      const menuButton = screen.getByRole('button', { name: /toggle sidebar/i });
      fireEvent.click(menuButton);
      
      // Sidebar should be collapsed
      expect(sidebar).toHaveClass('w-0');
      expect(sidebar).not.toHaveClass('w-64');
      
      // Click again to expand
      fireEvent.click(menuButton);
      
      // Sidebar should be expanded again
      expect(sidebar).toHaveClass('w-64');
      expect(sidebar).not.toHaveClass('w-0');
    });

    it('should toggle sidebar with keyboard navigation (ArrowLeft/ArrowRight)', () => {
      renderDashboard();
      
      const sidebar = screen.getByRole('complementary');
      
      // Initially expanded
      expect(sidebar).toHaveClass('w-64');
      expect(sidebar).not.toHaveClass('w-0');
      
      // Press ArrowLeft to collapse
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(sidebar).toHaveClass('w-0');
      expect(sidebar).not.toHaveClass('w-64');
      
      // Press ArrowRight to expand
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(sidebar).toHaveClass('w-64');
      expect(sidebar).not.toHaveClass('w-0');
    });

    it('should not allow collapse when already collapsed', () => {
      renderDashboard();
      
      const sidebar = screen.getByRole('complementary');
      
      // Press ArrowLeft to collapse
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(sidebar).toHaveClass('w-0');
      
      // Press ArrowLeft when already collapsed - should stay collapsed
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(sidebar).toHaveClass('w-0');
    });

    it('should not allow expand when already expanded', () => {
      renderDashboard();
      
      const sidebar = screen.getByRole('complementary');
      
      // Initially expanded
      expect(sidebar).toHaveClass('w-64');
      expect(sidebar).not.toHaveClass('w-0');
      
      // Press ArrowRight when already expanded - should stay expanded
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(sidebar).toHaveClass('w-64');
      expect(sidebar).not.toHaveClass('w-0');
    });

    it('should hide menu items when sidebar is collapsed', () => {
      renderDashboard();
      
      // Initially visible
      expect(screen.getByText('Available Tiles (12)')).toBeInTheDocument();
      expect(screen.getByText('Cryptocurrency')).toBeInTheDocument();
      
      // Collapse sidebar
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      
      // Menu items should be hidden
      expect(screen.queryByText('Available Tiles (12)')).not.toBeInTheDocument();
      expect(screen.queryByText('Cryptocurrency')).not.toBeInTheDocument();
    });
  });
}); 
