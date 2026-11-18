import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchAuthStatus, fetchMe, signOut } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [ready, setReady] = useState(false);

  const applyMe = useCallback((data) => {
    setUser(data.user);
    setPlans(data.plans || []);
    setUnreadMessages(data.unreadMessages || 0);
  }, []);

  const refresh = useCallback(
    () =>
      fetchMe()
        .then(applyMe)
        .catch(() => {
          setUser(null);
          setPlans([]);
          setUnreadMessages(0);
        }),
    [applyMe]
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
    setPlans([]);
    setUnreadMessages(0);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, plans, unreadMessages, setUnreadMessages, emailConfigured, ready, refresh, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
