import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { AUTH_REQUIRED_VIEWS } from '../utils/views';

const NavigationContext = createContext(null);

// Auth modal modes: login, register, forgot, reset (with token), checkEmail (after sign-up).
export function NavigationProvider({ children }) {
  const { user } = useAuth();
  const [route, setRoute] = useState({ view: 'home', params: {} });
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });
  const [createOpen, setCreateOpen] = useState(false);
  // Bumped after a post is published so every feed on screen reloads.
  const [feedVersion, setFeedVersion] = useState(0);

  const openAuth = useCallback((mode = 'login', extra = {}) => setAuthModal({ open: true, mode, ...extra }), []);
  const closeAuth = useCallback(() => setAuthModal((m) => ({ ...m, open: false })), []);
  const setAuthMode = useCallback((mode) => setAuthModal((m) => ({ ...m, mode })), []);

  const navigate = useCallback((view, params = {}) => {
    setRoute({ view, params });
    window.scrollTo({ top: 0 });
  }, []);

  const showView = useCallback(
    (view, params) => {
      if (AUTH_REQUIRED_VIEWS.includes(view) && !user) {
        openAuth();
        return;
      }
      navigate(view, params);
    },
    [user, openAuth, navigate]
  );

  // Development-only hook for the automated responsive checks; not present in production builds.
  useEffect(() => {
    if (import.meta.env.DEV) window.__clarkeNavigate = navigate;
  }, [navigate]);

  const openCreate = useCallback(() => (user ? setCreateOpen(true) : openAuth()), [user, openAuth]);
  const closeCreate = useCallback(() => setCreateOpen(false), []);
  const bumpFeed = useCallback(() => setFeedVersion((v) => v + 1), []);

  return (
    <NavigationContext.Provider
      value={{
        view: route.view,
        params: route.params,
        showView,
        navigate,
        authModal,
        openAuth,
        closeAuth,
        setAuthMode,
        createOpen,
        openCreate,
        closeCreate,
        feedVersion,
        bumpFeed,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);
