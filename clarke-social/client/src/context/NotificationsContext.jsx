import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useSocketEvent } from './SocketContext';
import { listNotifications, markNotificationsRead } from '../services/notificationsService';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user, setUnreadMessages } = useAuth();
  const [state, setState] = useState({ items: [], unread: 0, loading: false, error: '' });
  const userId = user?.id;

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    return listNotifications()
      .then((d) => setState({ items: d.notifications, unread: d.unread, loading: false, error: '' }))
      .catch((e) => setState((s) => ({ ...s, loading: false, error: e.message })));
  }, []);

  useEffect(() => {
    if (!userId) return;
    listNotifications()
      .then((d) => setState({ items: d.notifications, unread: d.unread, loading: false, error: '' }))
      .catch(() => {});
  }, [userId]);

  useSocketEvent('notification:new', (n) => {
    setState((s) => ({ ...s, items: [n, ...s.items].slice(0, 40), unread: s.unread + 1 }));
    if (n.type === 'message') setUnreadMessages((c) => c + 1);
  });

  const markAllRead = useCallback(async () => {
    await markNotificationsRead();
    setState((s) => ({ ...s, unread: 0, items: s.items.map((n) => ({ ...n, read: true })) }));
  }, []);

  return (
    <NotificationsContext.Provider value={{ ...state, load, markAllRead }}>{children}</NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
