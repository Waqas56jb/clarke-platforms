// Handles links that bring members back to the site: email verification (?verify=), password reset
// (?reset=), WiPay checkout results (?payment=success|failed|cancelled) and shared posts (?post=).
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { verifyEmail } from '../services/authService';

const PAYMENT_OUTCOMES = ['success', 'failed', 'cancelled'];

export function useUrlActions() {
  const { ready, setUser, refresh } = useAuth();
  const { openAuth, navigate } = useNavigation();
  const toast = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (!ready || handled.current) return;
    handled.current = true;
    const params = new URLSearchParams(window.location.search);
    // Remove one-off parameters (tokens, payment outcome) but keep the ?view= route.
    const clear = () => {
      const kept = new URLSearchParams(window.location.search);
      ['verify', 'reset', 'payment', 'post'].forEach((key) => kept.delete(key));
      const rest = kept.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${rest ? `?${rest}` : ''}`);
    };

    if (params.get('verify')) {
      verifyEmail(params.get('verify'))
        .then((d) => {
          setUser(d.user);
          refresh();
          toast(d.message, 'success');
        })
        .catch((e) => toast(e.message, 'error'));
    }
    if (params.get('reset')) openAuth('reset', { token: params.get('reset') });
    const payment = params.get('payment');
    if (payment) {
      refresh();
      // The plans page shows the result dialog for this outcome.
      navigate('premium', { payment: PAYMENT_OUTCOMES.includes(payment) ? payment : 'failed' }, { replace: true });
    }
    if (params.get('verify') || params.get('reset')) clear();
    if (params.get('post')) navigate('post', { id: Number(params.get('post')) }, { replace: true });
  }, [ready, setUser, refresh, openAuth, navigate, toast]);
}
