import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { AUTH_REQUIRED_VIEWS, KNOWN_VIEWS } from '../utils/views';

const NavigationContext = createContext(null);

// The current screen is mirrored in the address (?view=messages&userId=12) so a refresh, a shared
// link or the browser's back/forward buttons land on the same screen.
const ROUTE_KEYS = ['id', 'userId', 'tab', 'q'];

function readRoute() {
  const query = new URLSearchParams(window.location.search);
  const view = query.get('view');
  if (!KNOWN_VIEWS.includes(view)) return { view: 'home', params: {} };
  const params = {};
  for (const key of ROUTE_KEYS) {
    const value = query.get(key);
    if (value !== null && value !== '') params[key] = /^\d+$/.test(value) ? Number(value) : value;
  }
  return { view, params };
}

function routeUrl(view, params) {
  if (view === 'home') return window.location.pathname;
  const query = new URLSearchParams({ view });
  for (const key of ROUTE_KEYS) if (params[key] !== undefined && params[key] !== '') query.set(key, params[key]);
  return `${window.location.pathname}?${query}`;
}

// Auth modal modes: login, register, forgot, reset (with token), checkEmail (after sign-up).
export function NavigationProvider({ children }) {
  const { user } = useAuth();
  const [route, setRoute] = useState(readRoute);
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });
  const [createOpen, setCreateOpen] = useState(false);
  // Bumped after a post is published so every feed on screen reloads.
  const [feedVersion, setFeedVersion] = useState(0);

  const openAuth = useCallback((mode = 'login', extra = {}) => setAuthModal({ open: true, mode, ...extra }), []);
  const closeAuth = useCallback(() => setAuthModal((m) => ({ ...m, open: false })), []);
  const setAuthMode = useCallback((mode) => setAuthModal((m) => ({ ...m, mode })), []);

  // options.replace swaps the current history entry instead of adding one.
  const navigate = useCallback((view, params = {}, { replace = false } = {}) => {
    setRoute({ view, params });
    const url = routeUrl(view, params);
    if (url !== `${window.location.pathname}${window.location.search}`)
      window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
    window.scrollTo({ top: 0 });
  }, []);

  // For state kept inside a page (open conversation, dating tab): update the address only.
  const syncUrl = useCallback((view, params = {}) => {
    window.history.replaceState({}, '', routeUrl(view, params));
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(readRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
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
        syncUrl,
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
