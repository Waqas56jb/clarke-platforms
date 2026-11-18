import { useEffect } from 'react';
import { useToast } from '../context/ToastContext';

// Stripe Checkout redirects back with ?payment=success|cancelled.
export function usePaymentResult(ready) {
  const toast = useToast();
  useEffect(() => {
    if (!ready) return;
    const result = new URLSearchParams(window.location.search).get('payment');
    if (result === 'success') toast('Checkout completed. Payment status will update after Stripe confirms it.');
    if (result === 'cancelled') toast('Checkout was cancelled.');
    if (result) window.history.replaceState({}, '', window.location.pathname);
  }, [ready, toast]);
}
