import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ExchangeProvider } from './context/ExchangeContext';
import './styles/wse.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ExchangeProvider>
      <App />
    </ExchangeProvider>
  </StrictMode>
);
