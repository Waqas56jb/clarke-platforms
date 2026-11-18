import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMarkets } from '../services/marketsService';
import { useAsync } from './useAsync';

// Instruments from GET /api/markets (with the signed-in member's watch flags) and a helper that updates
// one instrument's watch flag after the star is toggled.
export function useMarkets() {
  const { user } = useAuth();
  const state = useAsync(fetchMarkets, [user?.id]);
  const { setData } = state;
  const setWatched = useCallback(
    (id, watched) =>
      setData((d) => d && { ...d, instruments: d.instruments.map((i) => (i.id === id ? { ...i, watched } : i)) }),
    [setData]
  );
  return { ...state, setWatched };
}
