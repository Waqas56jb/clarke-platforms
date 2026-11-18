import { CircleCheck, CircleX } from 'lucide-react';
import Dialog from '../ui/Dialog';

const RESULTS = {
  success: {
    title: 'Payment complete',
    message: 'Thank you. WiPay confirmed your payment and your purchase is now active on your account.',
  },
  cancelled: {
    title: 'Checkout cancelled',
    message: 'You left WiPay before paying, so you have not been charged.',
  },
  failed: {
    title: 'Payment not completed',
    message: "Your payment couldn't be completed. Please check your payment details.",
  },
};

// Shown when WiPay sends the member back with ?payment=<outcome>.
export default function PaymentResultDialog({ outcome, onClose, onRetry }) {
  const ok = outcome === 'success';
  const result = RESULTS[outcome] || RESULTS.failed;
  return (
    <Dialog
      title={result.title}
      hideTitle
      onClose={onClose}
      footer={
        ok ? (
          <button type="button" className="btn btn-primary" onClick={onClose} data-autofocus>
            Done
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={onRetry} data-autofocus>
              Try again
            </button>
          </>
        )
      }
    >
      <div className={`payment-result ${ok ? 'success' : 'failed'}`}>
        <span className="payment-result-icon" aria-hidden="true">
          {ok ? <CircleCheck size={40} /> : <CircleX size={40} />}
        </span>
        <p className="payment-result-title" aria-hidden="true">
          {result.title}
        </p>
        <p>{result.message}</p>
      </div>
    </Dialog>
  );
}
