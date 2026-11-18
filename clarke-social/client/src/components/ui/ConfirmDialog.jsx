// Promise-based replacements for window.confirm / window.prompt, rendered with the app's dialog.
import { createContext, useCallback, useContext, useState } from 'react';
import Dialog from './Dialog';

const ConfirmContext = createContext(null);

function ConfirmView({ request, onDone }) {
  const [value, setValue] = useState('');
  const isPrompt = request.kind === 'prompt';
  const submit = (e) => {
    e.preventDefault();
    if (isPrompt && request.required !== false && !value.trim()) return;
    onDone(isPrompt ? value.trim() : true);
  };
  return (
    <Dialog title={request.title} onClose={() => onDone(isPrompt ? null : false)}>
      <form onSubmit={submit} className="stack">
        {request.message && <p>{request.message}</p>}
        {isPrompt && request.options && (
          <div className="chip-row" style={{ flexWrap: 'wrap' }}>
            {request.options.map((option) => (
              <button
                type="button"
                key={option}
                className="chip"
                aria-pressed={value === option}
                onClick={() => setValue(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        {isPrompt && (
          <label className="field">
            <span className="field-label">{request.label || 'Details'}</span>
            <textarea
              value={value}
              maxLength={request.maxLength || 500}
              onChange={(e) => setValue(e.target.value)}
              placeholder={request.placeholder}
              data-autofocus
              rows={3}
            />
          </label>
        )}
        <div className="row" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={() => onDone(isPrompt ? null : false)}>
            Cancel
          </button>
          <button
            type="submit"
            className={`btn ${request.danger ? 'btn-danger' : 'btn-primary'}`}
            data-autofocus={!isPrompt || undefined}
            disabled={isPrompt && request.required !== false && !value.trim()}
          >
            {request.confirmLabel || (isPrompt ? 'Submit' : 'Confirm')}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);

  const ask = useCallback(
    (kind, options) =>
      new Promise((resolve) => {
        setRequest({ ...options, kind, resolve });
      }),
    []
  );
  const confirm = useCallback((options) => ask('confirm', options), [ask]);
  const prompt = useCallback((options) => ask('prompt', options), [ask]);

  const done = (result) => {
    request.resolve(result);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm, prompt }}>
      {children}
      {request && <ConfirmView key={request.title} request={request} onDone={done} />}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);

export const REPORT_REASONS = [
  'Spam',
  'Harassment or bullying',
  'Hate speech',
  'Nudity or sexual content',
  'Violence',
  'Copyright',
  'Scam or fraud',
  'Something else',
];

// Opens the report sheet; resolves to the reason text, or null if cancelled.
export function useReport() {
  const { prompt } = useConfirm();
  return (what) =>
    prompt({
      title: `Report ${what}`,
      message: 'Reports are private. Choose a reason or describe the problem.',
      options: REPORT_REASONS,
      label: 'Reason',
      placeholder: 'What is wrong?',
      confirmLabel: 'Send report',
    });
}
