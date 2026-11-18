import { useAuth } from '../context/AuthContext';

// Shown to members whose email is unverified because email sending is not configured on the server.
export default function EmailNotice() {
  const { user, emailConfigured } = useAuth();
  if (!user || user.emailVerified || emailConfigured) return null;
  return (
    <div className="live-notice" role="status">
      Email verification is not available yet because email sending has not been configured. Your account works
      normally; you will be able to verify your email once it is set up.
    </div>
  );
}
