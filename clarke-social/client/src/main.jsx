import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CallProvider } from './context/CallContext';
import { NavigationProvider } from './context/NavigationContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import './styles/clarke.css';
import './styles/preview-sections.css';
import './styles/live-features.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <NavigationProvider>
          <SocketProvider>
            <NotificationsProvider>
              <CallProvider>
                <App />
              </CallProvider>
            </NotificationsProvider>
          </SocketProvider>
        </NavigationProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
);
