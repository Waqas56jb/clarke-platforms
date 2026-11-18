import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { startCheckout } from '../services/paymentsService';

// Sends the member to WiPay's hosted checkout page; card details are never entered on Clarke.
export function useCheckout() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  return async (payload) => {
    if (!user) return openAuth();
    try {
      const { url } = await startCheckout(typeof payload === 'string' ? { plan: payload } : payload);
      window.location.href = url;
    } catch (e) {
      toast(e.message);
    }
  };
}
