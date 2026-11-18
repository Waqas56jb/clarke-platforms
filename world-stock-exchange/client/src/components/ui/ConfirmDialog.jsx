// Promise-based replacement for window.confirm, rendered with the app's dialog.
import { createContext, useCallback, useContext, useState } from 'react';
import Dialog from './Dialog';

const ConfirmContext = createContext(null);

function ConfirmView({ request, onDone }) {
  return (
    <Dialog title={request.title} onClose={() => onDone(false)}>
      <div className="stack">
        {request.message && <p>{request.message}</p>}
        <div className="row" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={() => onDone(false)}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${request.danger ? 'btn-danger' : 'btn-primary'}`}
            id="confirmAction"
            data-autofocus
            onClick={() => onDone(true)}
          >
            {request.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);

  // confirm({ title, message, confirmLabel, danger }) resolves to true or false.
  const confirm = useCallback((options) => new Promise((resolve) => setRequest({ ...options, resolve })), []);

  const done = (result) => {
    request.resolve(result);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {request && <ConfirmView key={request.title} request={request} onDone={done} />}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
