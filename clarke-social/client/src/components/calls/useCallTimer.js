import { useEffect, useState } from 'react';
import { formatSeconds } from '../../utils/format';

// "m:ss" since the call connected, ticking every second; empty until connected.
export function useCallTimer(connectedAt) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!connectedAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [connectedAt]);
  return connectedAt ? formatSeconds(Math.max(0, now - connectedAt) / 1000) : '';
}
