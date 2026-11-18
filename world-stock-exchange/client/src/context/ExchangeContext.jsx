import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { listApplications } from '../services/issuersService';
import { listOrders } from '../services/ordersService';

const ExchangeContext = createContext(null);

// Issuer applications and company-share demo orders, shared by the listing, buying and issuer sections.
export function ExchangeProvider({ children }) {
  const [applications, setApplications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '' });

  const fetchAll = useCallback(
    () =>
      Promise.all([listApplications(), listOrders()])
        .then(([a, o]) => {
          setApplications(a.applications);
          setOrders(o.orders);
          setStatus({ loading: false, error: '' });
        })
        .catch((e) => setStatus({ loading: false, error: e.message })),
    []
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <ExchangeContext.Provider value={{ applications, orders, status, reload: fetchAll }}>
      {children}
    </ExchangeContext.Provider>
  );
}

export const useExchange = () => useContext(ExchangeContext);
