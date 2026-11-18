// Touch pull-to-refresh for the top of the page. Only engages when the page is scrolled to the top and
// the finger moves down; any other gesture is left to the browser.
import { useEffect, useRef, useState } from 'react';

export const PULL_THRESHOLD = 60;
const MAX_PULL = 110;

export function usePullToRefresh(onRefresh, enabled) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshRef = useRef(onRefresh);

  useEffect(() => {
    refreshRef.current = onRefresh;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    let start = null;
    let distance = 0;
    let busy = false;

    const reset = () => {
      start = null;
      if (distance) setPull(0);
      distance = 0;
    };
    const onStart = (e) => {
      if (busy || window.scrollY > 0 || e.touches.length !== 1) return;
      if (document.body.classList.contains('scroll-locked')) return;
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onMove = (e) => {
      if (!start) return;
      const dy = e.touches[0].clientY - start.y;
      const dx = Math.abs(e.touches[0].clientX - start.x);
      if (dy <= 0 || dx > dy || window.scrollY > 0) return reset();
      e.preventDefault();
      distance = Math.min(dy * 0.6, MAX_PULL);
      setPull(distance);
    };
    const onEnd = async () => {
      if (!start) return;
      const trigger = distance >= PULL_THRESHOLD;
      reset();
      if (!trigger) return;
      busy = true;
      setRefreshing(true);
      try {
        await refreshRef.current();
      } finally {
        busy = false;
        setRefreshing(false);
      }
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    document.addEventListener('touchcancel', reset);
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', reset);
    };
  }, [enabled]);

  return { pull, refreshing };
}
