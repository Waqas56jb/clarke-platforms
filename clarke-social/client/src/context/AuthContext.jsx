import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchMe, signOut } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchMe()
      .then(({ user: me }) => setUser(me))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, setUser, ready, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
