// Loading, error (with retry) and empty states shared by every page.
export function Loading({ text = 'Loading…' }) {
  return <div className="loading-card">{text}</div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="empty-state" role="alert">
      <b>Something went wrong</b>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = '✧', title, children }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 28, color: '#155eef' }}>{icon}</div>
      <b>{title}</b>
      {children && <p>{children}</p>}
    </div>
  );
}

// Renders loading / error states for a useAsync result, otherwise the children.
export function AsyncView({ state, loadingText, children }) {
  if (state.loading && !state.data) return <Loading text={loadingText} />;
  if (state.error && !state.data) return <ErrorState message={state.error} onRetry={state.reload} />;
  return children(state.data);
}
