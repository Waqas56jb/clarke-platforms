import { useAuth } from '../context/AuthContext';
import PaymentCard from '../components/PaymentCard';
import { ConfigNotice, PlanStatus } from '../components/PlanStatus';
import { AsyncView } from '../components/StateView';
import ViewHeading from '../components/ViewHeading';
import { useAsync } from '../hooks/useAsync';
import { useCheckout } from '../hooks/useCheckout';
import { paymentConfig, paymentHistory } from '../services/paymentsService';
import { formatDateTime, money } from '../utils/format';

const CARDS = [
  {
    plan: 'supporter_monthly',
    eyebrow: 'COMMUNITY',
    title: 'Clarke Supporter',
    text: 'Support the platform and help Clarke grow.',
    buttonLabel: 'Get 30 days',
  },
  {
    plan: 'creator_monthly',
    eyebrow: 'FOR CREATORS',
    title: 'Creator Plus',
    text: 'Support creator tools and premium experiences.',
    buttonLabel: 'Get 30 days',
    featured: true,
  },
  {
    plan: 'one_time_support',
    eyebrow: 'ONE-TIME',
    title: 'Support Clarke',
    text: 'Make a one-time contribution.',
    buttonLabel: 'Pay once',
  },
];

const STATUS = { paid: 'Paid', pending: 'Pending', failed: 'Failed', cancelled: 'Cancelled' };

function PaymentHistory() {
  const state = useAsync(() => paymentHistory().then((d) => d.payments), []);
  return (
    <div id="paymentHistory">
      <AsyncView state={state} loadingText="Loading…">
        {(payments) =>
          payments.length ? (
            payments.map((p) => (
              <div className="settings-row" key={p.reference}>
                <span>
                  <b>{p.name}</b>
                  <small>
                    {formatDateTime(p.createdAt)} · {STATUS[p.status]} · Ref {p.reference}
                  </small>
                </span>
                <b>{money(p.amount, p.currency)}</b>
              </div>
            ))
          ) : (
            <p>No payments yet.</p>
          )
        }
      </AsyncView>
    </div>
  );
}

export default function PremiumPage() {
  const { user } = useAuth();
  const checkout = useCheckout();
  const config = useAsync(() => paymentConfig(), []);
  const priceOf = (plan) => {
    const p = config.data?.plans.find((x) => x.key === plan);
    return p ? money(p.amount, p.currency) : '…';
  };
  return (
    <>
      <ViewHeading
        title="Clarke Payments"
        subtitle="Optional memberships and creator support. Secure checkout is handled by WiPay."
      />
      <PlanStatus />
      <ConfigNotice config={config.data} />
      <div className="payment-grid">
        {CARDS.map(({ plan, ...card }) => (
          <PaymentCard
            key={plan}
            {...card}
            price={priceOf(plan)}
            period={plan === 'one_time_support' ? 'once' : '/ 30 days'}
            onPay={() => checkout(plan)}
          />
        ))}
      </div>
      <div className="card-panel" style={{ padding: 18, marginTop: 16 }}>
        <h3>Payment history</h3>
        {user ? <PaymentHistory /> : <p>Sign in to view payment history.</p>}
        <p className="fine-print">
          Payments open on WiPay&apos;s secure checkout page and are charged in US dollars. Clarke never sees or stores
          your card number. WiPay does not offer automatic renewals, so each plan purchase gives 30 days of access and
          you can renew at any time.
        </p>
      </div>
    </>
  );
}
