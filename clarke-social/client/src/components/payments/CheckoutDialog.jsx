import { useState } from 'react';
import { FlaskConical, Lock } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { paymentConfig, startCheckout } from '../../services/paymentsService';
import { money } from '../../utils/format';
import Dialog from '../ui/Dialog';

// Confirms the selected plan or rental, then redirects to WiPay's hosted checkout.
export default function CheckoutDialog({ item, onClose }) {
  const config = useAsync(() => paymentConfig(), []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const unavailable = Boolean(config.data && !config.data.enabled);

  const pay = async () => {
    setError('');
    setBusy(true);
    try {
      const { url } = await startCheckout(item.payload);
      window.location.href = url;
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <Dialog
      title="Checkout"
      onClose={onClose}
      dismissible={!busy}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={pay}
            disabled={busy || unavailable}
            aria-busy={busy}
            data-autofocus
          >
            {busy && <span className="spinner" aria-hidden="true" />}
            {busy ? 'Opening WiPay…' : 'Continue to WiPay'}
          </button>
        </>
      }
    >
      <div className="stack">
        <div className="checkout-summary">
          <div className="grow">
            <p className="checkout-name">{item.name}</p>
            <p className="caption">{item.term}</p>
          </div>
          <p className="checkout-amount">
            {money(item.amount, item.currency)} <span className="caption">{item.currency}</span>
          </p>
        </div>
        <p className="row-top">
          <Lock size={16} aria-hidden="true" />
          <span>
            You&apos;ll enter your card details on WiPay&apos;s secure page. Clarke never sees your card number.
          </span>
        </p>
        {config.data?.enabled && config.data.environment === 'sandbox' && (
          <p className="notice">
            <FlaskConical size={18} aria-hidden="true" />
            <span>Test mode: this checkout uses the WiPay sandbox and no real money is taken.</span>
          </p>
        )}
        {unavailable && (
          <p className="notice notice-warning">Payments are not configured yet, so checkout is unavailable.</p>
        )}
        <div role="alert">{error && <p className="notice notice-error">{error}</p>}</div>
      </div>
    </Dialog>
  );
}
