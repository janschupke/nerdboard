import { createContext, useContext, useRef } from 'react';

export const RefreshContext = createContext<number>(0);

export const useRefreshKey = () => useContext(RefreshContext);

export function useForceRefreshFromKey(): boolean {
  const refreshKey = useRefreshKey();
  const prevKey = useRef<number | undefined>(undefined);
  const isForce = prevKey.current !== undefined && refreshKey !== prevKey.current;
  prevKey.current = refreshKey;
  return isForce;
}
