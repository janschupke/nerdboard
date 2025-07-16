import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { RefreshContext, useForceRefreshFromKey } from './RefreshContext';

function createWrapper() {
  function Wrapper({ children }: { children: React.ReactNode }) {
    const [key, setKey] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Wrapper as any).setKey = setKey;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Wrapper as any).getKey = () => key;
    return <RefreshContext.Provider value={key}>{children}</RefreshContext.Provider>;
  }
  return Wrapper;
}

describe('useForceRefreshFromKey', () => {
  it('returns false on initial render', () => {
    const Wrapper = createWrapper();
    const { result } = renderHook(() => useForceRefreshFromKey(), {
      wrapper: Wrapper,
    });
    expect(result.current).toBe(false);
  });

  // TODO: Fix this test
  it.skip('returns true when context value changes', () => {
    const Wrapper = createWrapper();
    const { result, rerender } = renderHook(() => useForceRefreshFromKey(), {
      wrapper: Wrapper,
    });
    expect(result.current).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    act(() => (Wrapper as any).setKey(1));
    rerender(); // effect runs, sets isForce to true
    rerender(); // now isForce is true
    expect(result.current).toBe(true);
    rerender(); // effect runs, sets isForce to false
    expect(result.current).toBe(false);
  });

  // TODO: Fix this test
  it.skip('returns true only once per context value change', () => {
    const Wrapper = createWrapper();
    const { result, rerender } = renderHook(() => useForceRefreshFromKey(), {
      wrapper: Wrapper,
    });
    expect(result.current).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    act(() => (Wrapper as any).setKey(2));
    rerender();
    rerender();
    expect(result.current).toBe(true);
    rerender();
    expect(result.current).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    act(() => (Wrapper as any).setKey(3));
    rerender();
    rerender();
    expect(result.current).toBe(true);
    rerender();
    expect(result.current).toBe(false);
  });
});
