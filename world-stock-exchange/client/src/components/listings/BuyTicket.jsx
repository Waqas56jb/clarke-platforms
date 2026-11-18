// Buying ticket for an approved listing → POST /api/listings/:id/orders. Orders are practice only.
import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { buyShares } from '../../services/listingsService';
import { count, currencyAmount, money, sharePrice } from '../../utils/format';

const DISCLAIMER = 'Demo only. No payment, share transfer or legal purchase takes place.';

export default function BuyTicket({ listing: l, onBought }) {
  const { user, refresh } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const [quantity, setQuantity] = useState('1');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const q = Number(quantity);
  const valid = Number.isInteger(q) && q >= 1;
  const soldOut = l.remainingShares < 1;

  const place = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuth('login');
      return;
    }
    if (!valid) {
      setResult({ ok: false, text: 'Choose an approved listing and enter at least one share.' });
      return;
    }
    if (q > l.remainingShares) {
      setResult({ ok: false, text: `Only ${count(l.remainingShares)} shares remain in this demonstration listing.` });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const r = await buyShares(l.id, q);
      setResult({
        ok: true,
        text: `Demo order recorded for ${count(q)} share(s) of ${l.name}. No payment or ownership transfer occurred. Practice balance charged ${money(r.practiceCost)} (order ${r.order.reference}).`,
      });
      toast(`Demo order ${r.order.reference} recorded.`, 'success');
      setQuantity('1');
      onBought(r.listing);
      await refresh();
    } catch (err) {
      setResult({ ok: false, text: err.message });
      toast(err.message, 'error');
      // Another investor may have bought shares meanwhile: show the current remaining count.
      if (err.code === 'SOLD_OUT') onBought(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel" aria-labelledby="buyingTicketTitle">
      <div className="eyebrow">BUYING TICKET</div>
      <h3 id="buyingTicketTitle">
        {l.name} ({l.symbol})
      </h3>
      <form className="stack" onSubmit={place} noValidate>
        <div className="trade-row">
          <span className="muted">Offer price</span>
          <b id="buyingTicketPrice">{sharePrice(l.currency, l.price)}</b>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="buyingQuantity">
            Number of shares
          </label>
          <input
            id="buyingQuantity"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            max={l.remainingShares}
            value={quantity}
            disabled={soldOut}
            aria-invalid={quantity !== '' && !valid}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="trade-row">
          <span className="muted">Estimated order value</span>
          <b id="buyingEstimate">{valid ? currencyAmount(l.currency, q * l.price) : '—'}</b>
        </div>
        <button className="btn btn-buy" id="placeCompanyOrder" disabled={busy || soldOut} aria-busy={busy}>
          {busy && <span className="spinner" aria-hidden="true" />}
          {soldOut ? 'Sold out' : 'Place demo buy order'}
        </button>
        <div role="status" aria-live="polite">
          {result && (
            <p className={`notice ${result.ok ? 'notice-success' : 'notice-error'}`}>
              {result.ok ? <CheckCircle2 size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
              <span>{result.text}</span>
            </p>
          )}
        </div>
        <p id="buyingMessage" className="fine-print">
          {DISCLAIMER}
        </p>
        <p className="fine-print">
          The order value is charged to your practice balance in US dollars at the exchange&apos;s stored rate.
          {!user && ' Sign in or open a practice account to place an order.'}
        </p>
      </form>
    </section>
  );
}
