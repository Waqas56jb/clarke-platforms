import { useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

// Holds the item a member chose to pay for. Render <CheckoutDialog item={checkout.item} onClose={checkout.close} />
// while `item` is set; the dialog sends the member to WiPay's hosted page (card details never touch Clarke).
// Item: { payload: { plan } | { plan: 'movie_rental', movieId }, name, amount (cents), currency, term }.
export function useCheckout() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const [item, setItem] = useState(null);
  const choose = useCallback((next) => (user ? setItem(next) : openAuth()), [user, openAuth]);
  const close = useCallback(() => setItem(null), []);
  return { item, choose, close };
}
