import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DemoMessageProvider } from './context/DemoMessageContext';
import './styles/clarke-coin.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DemoMessageProvider>
      <App />
    </DemoMessageProvider>
  </StrictMode>
);
