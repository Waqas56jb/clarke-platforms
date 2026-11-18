import { useCallback, useEffect, useRef, useState } from 'react';

// Runs `load` whenever `deps` change and exposes { data, loading, error, reload, setData }.
export function useAsync(load, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const loadRef = useRef(load);
  const key = JSON.stringify(deps);

  useEffect(() => {
    loadRef.current = load;
  });

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    return loadRef
      .current()
      .then((data) => setState({ data, loading: false, error: '' }))
      .catch((e) => setState((s) => ({ ...s, loading: false, error: e.message })));
  }, []);

  useEffect(() => {
    let active = true;
    loadRef
      .current()
      .then((data) => active && setState({ data, loading: false, error: '' }))
      .catch((e) => active && setState({ data: null, loading: false, error: e.message }));
    return () => {
      active = false;
    };
  }, [key]);

  const setData = useCallback((update) => setState((s) => ({ ...s, data: update(s.data) })), []);
  return { ...state, reload, setData };
}
