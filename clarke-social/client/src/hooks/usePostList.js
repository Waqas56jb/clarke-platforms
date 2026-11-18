// A list of posts from the API plus helpers to patch or drop one post after an action.
import { useCallback } from 'react';
import { useAsync } from './useAsync';

export function usePostList(load, deps) {
  const state = useAsync(load, deps);
  const { setData } = state;
  const update = useCallback(
    (id, change) =>
      setData((list) =>
        list.map((p) => (p.id === id ? { ...p, ...(typeof change === 'function' ? change(p) : change) } : p))
      ),
    [setData]
  );
  const remove = useCallback((id) => setData((list) => list.filter((p) => p.id !== id)), [setData]);
  return { ...state, update, remove };
}
