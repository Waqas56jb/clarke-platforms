import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [state, setState] = useState({ message: '', show: false });
  const timer = useRef(null);

  const toast = useCallback((message) => {
    setState({ message, show: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState((s) => ({ ...s, show: false })), 2600);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Toast message={state.message} show={state.show} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
