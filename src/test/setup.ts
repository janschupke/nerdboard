import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally for tests with better error handling
(globalThis as typeof globalThis & { fetch: ReturnType<typeof vi.fn> }).fetch = vi.fn().mockImplementation((url: string) => {
  // Mock successful responses for common API endpoints
  if (url.includes('api.coingecko.com')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 50000,
          market_cap: 1000000000000,
          price_change_percentage_24h: 2.5,
          image: 'https://example.com/bitcoin.png',
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 3000,
          market_cap: 400000000000,
          price_change_percentage_24h: 1.8,
          image: 'https://example.com/ethereum.png',
        },
      ]),
    });
  }
  
  if (url.includes('api.metals.live')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([
        {
          name: 'Gold',
          price: 2000,
          change: 0.5,
          unit: 'oz',
        },
        {
          name: 'Silver',
          price: 25,
          change: -0.2,
          unit: 'oz',
        },
      ]),
    });
  }

  // Default mock response
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  });
});

// Mock IntersectionObserver
(globalThis as typeof globalThis & { IntersectionObserver: ReturnType<typeof vi.fn> }).IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
(globalThis as typeof globalThis & { ResizeObserver: ReturnType<typeof vi.fn> }).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Suppress console.error and console.warn during tests
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
