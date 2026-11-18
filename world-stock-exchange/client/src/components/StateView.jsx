// Loading (skeleton), error (with retry) and empty states shared by every screen.
import { AlertCircle, Inbox } from 'lucide-react';
import Skeleton from './ui/Skeleton';

export function Loading({ text = 'Loading', variant = 'card', count = 1, grid }) {
  return <Skeleton variant={variant} count={count} label={text} grid={grid} />;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, plain }) {
  return (
    <div className={`state-panel error${plain ? ' plain' : ''}`} role="alert">
      <div className="state-icon">
        <AlertCircle size={32} aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && (
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, children, action, plain }) {
  return (
    <div className={`state-panel${plain ? ' plain' : ''}`}>
      <div className="state-icon">
        <Icon size={32} aria-hidden="true" />
      </div>
      {title && <h3>{title}</h3>}
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

// Renders skeleton / error states for a useAsync result, otherwise the children.
export function AsyncView({ state, loadingText, skeleton = 'card', count = 1, grid, errorTitle, children }) {
  if (state.loading && !state.data) return <Loading text={loadingText} variant={skeleton} count={count} grid={grid} />;
  if (state.error && !state.data) return <ErrorState title={errorTitle} message={state.error} onRetry={state.reload} />;
  return children(state.data);
}
