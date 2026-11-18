import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PaymentCard from '../components/PaymentCard';
import ViewHeading from '../components/ViewHeading';
import { useCheckout } from '../hooks/useCheckout';
import { paymentHistory } from '../services/paymentsService';

const PLANS = [
  {
    plan: 'supporter_monthly',
    eyebrow: 'COMMUNITY',
    title: 'Clarke Supporter',
    price: '£4.99',
    period: '/ month',
    text: 'Support the platform and help Clarke grow.',
    buttonLabel: 'Subscribe monthly',
  },
  {
    plan: 'creator_monthly',
    eyebrow: 'FOR CREATORS',
    title: 'Creator Plus',
    price: '£9.99',
    period: '/ month',
    text: 'Support creator tools and premium experiences.',
    buttonLabel: 'Subscribe monthly',
    featured: true,
  },
  {
    plan: 'one_time_support',
    eyebrow: 'ONE-TIME',
    title: 'Support Clarke',
    price: '£5.00',
    period: 'once',
    text: 'Make a one-time contribution.',
    buttonLabel: 'Pay once',
  },
];

function PaymentHistory() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    if (!user) return;
    paymentHistory()
      .then(({ payments }) => setState({ payments }))
      .catch((e) => setState({ error: e.message }));
  }, [user]);

  let content;
  if (!user) content = <p>Sign in to view payment history.</p>;
  else if (state.loading) content = 'Loading…';
  else if (state.error) content = state.error;
  else if (!state.payments.length) content = <p>No payments yet.</p>;
  else
    content = state.payments.map((p, i) => (
      <div className="settings-row" key={`${p.created_at}-${i}`}>
        <span>
          <b>{p.product_key.replaceAll('_', ' ')}</b>
          <small>
            {p.created_at} · {p.status}
          </small>
        </span>
        <b>£{(p.amount / 100).toFixed(2)}</b>
      </div>
    ));
  return <div id="paymentHistory">{content}</div>;
}

export default function PremiumPage() {
  const checkout = useCheckout();
  return (
    <>
      <ViewHeading
        title="Clarke Payments"
        subtitle="Optional memberships and creator support. Secure checkout is handled by Stripe."
      />
      <div className="payment-grid">
        {PLANS.map(({ plan, ...card }) => (
          <PaymentCard key={plan} {...card} onPay={() => checkout(plan)} />
        ))}
      </div>
      <div className="card-panel" style={{ padding: 18, marginTop: 16 }}>
        <h3>Payment history</h3>
        <PaymentHistory />
        <p className="fine-print">
          Payments open on Stripe Checkout. Clarke does not store card numbers. Subscriptions and payment status require
          Stripe keys and a verified webhook before accepting live payments.
        </p>
      </div>
    </>
  );
}
