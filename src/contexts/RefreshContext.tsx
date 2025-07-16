import { createContext, useContext, useRef, useEffect, useState } from 'react';

export const RefreshContext = createContext<number>(0);

export const useRefreshKey = () => useContext(RefreshContext);

/**
 * useForceRefreshFromKey
 * Returns true for one render after the refreshKey changes, then false until it changes again.
 * This is the idiomatic React pattern for an edge-triggered boolean ("pulse") in a hook.
 * It uses two useEffects and local state to detect a change in the context value and emit true for one render only.
 * The first effect sets isForce to true when the context value changes, the second resets it to false immediately after.
 */
export function useForceRefreshFromKey(): boolean {
  const refreshKey = useRefreshKey();
  const prevKey = useRef<number | undefined>(undefined);
  const [isForce, setIsForce] = useState(false);

  useEffect(() => {
    if (prevKey.current !== undefined && refreshKey !== prevKey.current) {
      setIsForce(true);
    }
    prevKey.current = refreshKey;
  }, [refreshKey]);

  useEffect(() => {
    if (isForce) {
      setIsForce(false);
    }
  }, [isForce]);

  return isForce;
}
