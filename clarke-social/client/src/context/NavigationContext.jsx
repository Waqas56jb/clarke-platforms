import { createContext, useCallback, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { AUTH_REQUIRED_VIEWS } from '../utils/views';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const { user } = useAuth();
  const [view, setView] = useState('home');
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });

  const openAuth = useCallback((mode = 'login') => setAuthModal({ open: true, mode }), []);
  const closeAuth = useCallback(() => setAuthModal((m) => ({ ...m, open: false })), []);
  const setAuthMode = useCallback((mode) => setAuthModal((m) => ({ ...m, mode })), []);

  const showView = useCallback(
    (next) => {
      if (AUTH_REQUIRED_VIEWS.includes(next) && !user) {
        openAuth();
        return;
      }
      setView(next);
    },
    [user, openAuth]
  );

  return (
    <NavigationContext.Provider
      value={{ view, showView, navigate: setView, authModal, openAuth, closeAuth, setAuthMode }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);
