// Handles links that bring members back to the site: email verification (?verify=), password reset
// (?reset=), WiPay checkout results (?payment=) and shared posts (?post=).
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { verifyEmail } from '../services/authService';

const PAYMENT_MESSAGES = {
  success: 'Payment complete. Thank you for supporting Clarke!',
  failed: 'The payment did not go through. You have not been charged for this order.',
  cancelled: 'Checkout was cancelled.',
};

export function useUrlActions() {
  const { ready, setUser, refresh } = useAuth();
  const { openAuth, navigate } = useNavigation();
  const toast = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (!ready || handled.current) return;
    handled.current = true;
    const params = new URLSearchParams(window.location.search);
    const clear = () => window.history.replaceState({}, '', window.location.pathname);

    if (params.get('verify')) {
      verifyEmail(params.get('verify'))
        .then((d) => {
          setUser(d.user);
          refresh();
          toast(d.message);
        })
        .catch((e) => toast(e.message));
    }
    if (params.get('reset')) openAuth('reset', { token: params.get('reset') });
    const payment = params.get('payment');
    if (payment) {
      toast(PAYMENT_MESSAGES[payment] || PAYMENT_MESSAGES.failed);
      refresh();
      navigate('premium');
    }
    if (params.get('post')) navigate('post', { id: Number(params.get('post')) });
    if ([...params.keys()].length) clear();
  }, [ready, setUser, refresh, openAuth, navigate, toast]);
}
