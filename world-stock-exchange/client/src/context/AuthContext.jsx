import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchAuthStatus, fetchMe, signOut } from '../services/authService';

const AuthContext = createContext(null);

// The signed-in account ({ id, username, displayName, email, emailVerified, roles, balance, createdAt })
// or null. `ready` turns true once the first session check has finished.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(
    () =>
      fetchMe()
        .then((data) => setUser(data.user))
        .catch(() => setUser(null)),
    []
  );

  useEffect(() => {
    fetchAuthStatus()
      .then((s) => setEmailConfigured(s.emailConfigured))
      .catch(() => {})
      .finally(() => refresh().finally(() => setReady(true)));
  }, [refresh]);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const hasRole = useCallback((role) => Boolean(user?.roles?.includes(role)), [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, emailConfigured, ready, refresh, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
