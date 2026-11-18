// Shows its children only to signed-in members; otherwise a sign-in prompt (also after a refresh on a
// screen that needs an account).
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { EmptyState, Loading } from '../StateView';

export default function RequireAuth({ title = 'Sign in to continue', message, children }) {
  const { user, ready } = useAuth();
  const { openAuth } = useNavigation();
  if (!ready) return <Loading text="Checking your session" count={2} />;
  if (user) return children;
  return (
    <EmptyState
      icon={LogIn}
      title={title}
      action={
        <div className="row-wrap" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-secondary" onClick={() => openAuth('login')}>
            Sign in
          </button>
          <button type="button" className="btn btn-accent" onClick={() => openAuth('register')}>
            Open account
          </button>
        </div>
      }
    >
      {message}
    </EmptyState>
  );
}
