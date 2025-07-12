import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock localStorage for theme
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    document.documentElement.classList.remove('dark');
  });

  function renderWithProviders() {
    return render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>,
    );
  }

  it('renders sidebar and pushes main content (not overlay)', () => {
    renderWithProviders();
    // Sidebar should be in the document
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toBeInTheDocument();
    // Sidebar should have width when open
    expect(sidebar).toHaveStyle({ width: '256px' });
    // Main content should be present
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('toggles sidebar open/close', () => {
    renderWithProviders();
    const toggleBtn = screen.getByLabelText(/toggle sidebar/i);
    const sidebar = screen.getByRole('complementary');
    // Sidebar open
    expect(sidebar).toHaveStyle({ width: '256px' });
    // Click toggle
    fireEvent.click(toggleBtn);
    // Sidebar closed (width 0)
    expect(sidebar).toHaveStyle({ width: '0px' });
  });

  it('toggles theme and persists to localStorage', () => {
    renderWithProviders();
    const themeBtn = screen.getByLabelText(/toggle theme/i);
    // Default is light
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    // Click to dark
    fireEvent.click(themeBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    // Click to light
    fireEvent.click(themeBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('shows correct tile count in header', () => {
    renderWithProviders();
    // Initially 0 tiles
    expect(screen.getByText(/0 tiles/i)).toBeInTheDocument();
    // Add a tile by simulating sidebar tile click
    const cryptoTile = screen.getByText(/cryptocurrency/i, { selector: 'h3' });
    const tileButton = cryptoTile.closest('[role="button"]');
    if (tileButton) {
      fireEvent.click(tileButton);
    } else {
      throw new Error('Sidebar tile button not found');
    }
    expect(screen.getByText(/1 tiles/i)).toBeInTheDocument();
  });
});
