import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);
const DURATION_MS = 3000;

// toast(message, type) — type is 'info' (default), 'success', 'error' or 'warning'.
export function ToastProvider({ children }) {
  const [state, setState] = useState({ message: '', type: 'info', show: false });
  const timer = useRef(null);

  const toast = useCallback((message, type = 'info') => {
    setState({ message, type, show: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState((s) => ({ ...s, show: false })), DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Toast message={state.message} show={state.show} type={state.type} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
