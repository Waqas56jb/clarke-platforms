// Handles links that bring members back to the site: email verification (?verify=) and password
// reset (?reset=). The tokens are removed from the address; the ?view= route is kept.
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { verifyEmail } from '../services/authService';

export function useUrlActions() {
  const { ready, setUser } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (!ready || handled.current) return;
    handled.current = true;
    const params = new URLSearchParams(window.location.search);
    const verify = params.get('verify');
    const reset = params.get('reset');
    if (!verify && !reset) return;

    params.delete('verify');
    params.delete('reset');
    const rest = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${rest ? `?${rest}` : ''}`);

    if (verify)
      verifyEmail(verify)
        .then((d) => {
          setUser(d.user);
          toast(d.message, 'success');
        })
        .catch((e) => toast(e.message, 'error'));
    if (reset) openAuth('reset', { token: reset });
  }, [ready, setUser, openAuth, toast]);
}
