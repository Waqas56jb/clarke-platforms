import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };

export default function Toast({ message, show, type = 'info' }) {
  const Icon = ICONS[type] || Info;
  return (
    <div className="toast-region" aria-live={type === 'error' ? 'assertive' : 'polite'}>
      <div className={`toast toast-${type}${show ? ' show' : ''}`} id="toast" role="status">
        {message && <Icon size={20} aria-hidden="true" />}
        <span>{message}</span>
      </div>
    </div>
  );
}
