import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DISMISS_KEY = 'wse-email-notice-dismissed';

function wasDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

// Shown to members whose email is unverified because email sending is not configured on the server.
// It can be dismissed for the rest of the browser session.
export default function EmailNotice() {
  const { user, emailConfigured } = useAuth();
  const [dismissed, setDismissed] = useState(wasDismissed);
  if (!user || user.emailVerified || emailConfigured || dismissed) return null;
  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Storage unavailable: hide it for this page view only.
    }
    setDismissed(true);
  };
  return (
    <div className="notice app-notice" role="status">
      <Info size={18} aria-hidden="true" />
      <span className="grow">Email verification isn&apos;t available yet. Your account works normally.</span>
      <button type="button" className="icon-btn" aria-label="Dismiss notice" onClick={dismiss}>
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
