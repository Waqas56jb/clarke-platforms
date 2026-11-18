import { useState } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { placeOrder } from '../services/ordersService';
import { remainingOf } from '../utils/format';

const INITIAL_MESSAGE = 'Demo only. No payment, share transfer or legal purchase takes place.';

const snapshotOf = (app) => ({
  title: `${app.name} (${app.symbol})`,
  price: `${app.currency} ${Number(app.price).toFixed(4)}`,
  max: remainingOf(app),
  disabled: remainingOf(app) < 1,
});

// Buying ticket for approved company-share listings. Orders are demonstrations only.
export function useBuyingTicket() {
  const { applications, reload } = useExchange();
  const [selectedId, setSelectedId] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [message, setMessage] = useState(INITIAL_MESSAGE);
  const [placing, setPlacing] = useState(false);

  const approved = (id) => applications.find((a) => a.id === id && a.status === 'Approved');
  const selected = approved(selectedId);
  const q = Math.max(0, Math.floor(Number(quantity) || 0));
  const estimate = selected ? `${selected.currency} ${(q * Number(selected.price)).toFixed(2)}` : '—';

  const select = (id) => {
    const app = approved(id);
    if (!app) return;
    setSelectedId(id);
    setTicket({ ...snapshotOf(app), disabled: false });
    setQuantity('1');
    setMessage('Demo ticket selected. Submitting records a local demonstration order only.');
    document.getElementById('buying').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const place = async () => {
    const qty = Math.floor(Number(quantity) || 0);
    if (!selected || qty < 1) {
      setMessage('Choose an approved listing and enter at least one share.');
      return;
    }
    const remaining = remainingOf(selected);
    if (qty > remaining) {
      setMessage(`Only ${remaining.toLocaleString()} shares remain in this demonstration listing.`);
      return;
    }
    setPlacing(true);
    try {
      const { application } = await placeOrder(selected.id, qty);
      setMessage(
        `Demo order recorded for ${qty.toLocaleString()} share(s) of ${selected.name}. No payment or ownership transfer occurred.`
      );
      setTicket(snapshotOf(application));
      setQuantity('1');
      await reload();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setPlacing(false);
    }
  };

  return { ticket, quantity, setQuantity, estimate, message, placing, select, place };
}
