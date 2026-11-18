import { useCallback, useState } from 'react';

const STORAGE_KEY = 'clarke_saved';

export function useSavedPosts() {
  const [ids, setIds] = useState(() => new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')));

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { has: (id) => ids.has(id), toggle };
}
