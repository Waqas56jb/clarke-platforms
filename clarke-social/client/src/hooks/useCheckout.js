import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { startCheckout } from '../services/paymentsService';

// Sends the member to Stripe Checkout; card details never touch Clarke.
export function useCheckout() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  return async (plan) => {
    if (!user) return openAuth();
    try {
      const { url } = await startCheckout(plan);
      window.location.href = url;
    } catch (e) {
      toast(e.message);
    }
  };
}
