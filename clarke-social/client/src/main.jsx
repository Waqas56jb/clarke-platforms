import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { AuthProvider } from './context/AuthContext';
import { CallProvider } from './context/CallContext';
import { NavigationProvider } from './context/NavigationContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/feed.css';
import './styles/social.css';
import './styles/media.css';
import './styles/account.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
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
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>
);
