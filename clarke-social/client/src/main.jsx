import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CallProvider } from './context/CallContext';
import { FeedProvider } from './context/FeedContext';
import { NavigationProvider } from './context/NavigationContext';
import { ToastProvider } from './context/ToastContext';
import './styles/clarke.css';
import './styles/preview-sections.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <NavigationProvider>
          <FeedProvider>
            <CallProvider>
              <App />
            </CallProvider>
          </FeedProvider>
        </NavigationProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
);
