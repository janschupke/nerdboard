// Patch fetch to handle relative URLs in test environment
// This patch only normalizes the URL and then calls the current global fetch (which may be a mock)
globalThis.fetch = ((prevFetch) => (input: RequestInfo | URL, init?: RequestInit) => {
  let url = input;
  if (typeof input === 'string' && input.startsWith('/')) {
    url = `http://localhost:3000${input}`;
  } else if (input instanceof Request && input.url.startsWith('/')) {
    url = new Request(`http://localhost:3000${input.url}`, input);
  }
  return prevFetch(url, init);
})(globalThis.fetch);

// Set base URL for jsdom environment
if (typeof window !== 'undefined' && window.location) {
  window.location.href = 'http://localhost:3000/';
}

import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

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
  value: vi.fn().mockImplementation((query) => ({
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
  length: 0,
  key: vi.fn(),
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
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
