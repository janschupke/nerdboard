import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally for tests with immediate responses
const mockFetch = vi.fn().mockImplementation(async () => {
  // Return immediate response without delays
  return new Response(JSON.stringify({ data: 'mock response' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

(globalThis as typeof globalThis & { fetch: ReturnType<typeof vi.fn> }).fetch = mockFetch;

// Mock IntersectionObserver
(
  globalThis as typeof globalThis & { IntersectionObserver: ReturnType<typeof vi.fn> }
).IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
(globalThis as typeof globalThis & { ResizeObserver: ReturnType<typeof vi.fn> }).ResizeObserver = vi
  .fn()
  .mockImplementation(() => ({
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

  // Clear all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
