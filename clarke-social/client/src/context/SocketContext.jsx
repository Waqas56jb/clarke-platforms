// One Socket.IO connection per signed-in member, made straight to the API host over WebSocket
// (the website proxy cannot carry WebSockets). Each (re)connect fetches a fresh short-lived token.
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { socketToken } from '../services/authService';
import { socketOrigin } from '../services/http';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const socket = useMemo(
    () =>
      userId
        ? io(socketOrigin(), {
            autoConnect: false,
            auth: (cb) =>
              socketToken()
                .then(({ token }) => cb({ token }))
                .catch(() => cb({ token: '' })),
            transports: ['websocket', 'polling'],
          })
        : null,
    [userId]
  );

  useEffect(() => {
    if (!socket) return undefined;
    socket.connect();
    return () => socket.disconnect();
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);

// Subscribes to a socket event for the lifetime of the component; the latest handler is always used.
export function useSocketEvent(event, handler) {
  const socket = useSocket();
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!socket) return undefined;
    const listener = (payload) => ref.current(payload);
    socket.on(event, listener);
    return () => socket.off(event, listener);
  }, [socket, event]);
}
