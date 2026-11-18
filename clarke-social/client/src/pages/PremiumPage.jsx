import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import CheckoutDialog from '../components/payments/CheckoutDialog';
import PaymentHistory from '../components/payments/PaymentHistory';
import PaymentResultDialog from '../components/payments/PaymentResultDialog';
import PlansSection from '../components/payments/PlansSection';
import { PlanStatus } from '../components/PlanStatus';
import { useCheckout } from '../hooks/useCheckout';

const CARDS = [
  {
    plan: 'supporter_monthly',
    eyebrow: 'Community',
    text: 'Support the platform and help Clarke grow.',
    buttonLabel: 'Get 30 days',
  },
  {
    plan: 'creator_monthly',
    eyebrow: 'For creators',
    text: 'Support creator tools and premium experiences.',
    buttonLabel: 'Get 30 days',
    recommended: true,
  },
  {
    plan: 'one_time_support',
    eyebrow: 'One-time',
    text: 'Make a one-time contribution.',
    buttonLabel: 'Pay once',
  },
];

export default function PremiumPage({ params }) {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const checkout = useCheckout();
  const plansRef = useRef(null);
  const [outcome, setOutcome] = useState(params?.payment || null);

  const retry = () => {
    setOutcome(null);
    plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    plansRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="plans-page">
      <header className="page-header">
        <div>
          <h1>Supporter &amp; Creator Plans</h1>
          <p>Optional memberships and creator support. Secure checkout is handled by WiPay.</p>
        </div>
      </header>
      <PlanStatus />
      <section className="section" aria-labelledby="plansTitle" ref={plansRef} tabIndex={-1}>
        <div className="section-title">
          <h2 id="plansTitle">Choose a plan</h2>
        </div>
        <PlansSection cards={CARDS} onChoose={checkout.choose} />
        <p className="fine-print">
          Prices are in US dollars. Payments open on WiPay&apos;s secure checkout page and Clarke never sees or stores
          your card number. WiPay does not offer automatic renewals, so each plan purchase gives 30 days of access and
          you can renew at any time.
        </p>
      </section>
      <section className="section" aria-labelledby="historyTitle">
        <div className="section-title">
          <h2 id="historyTitle">Payment history</h2>
        </div>
        <div className="card card-pad">
          {user ? (
            <PaymentHistory />
          ) : (
            <div className="row-wrap">
              <p className="grow">Sign in to view your payment history.</p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => openAuth()}>
                Sign in
              </button>
            </div>
          )}
        </div>
      </section>
      {checkout.item && <CheckoutDialog item={checkout.item} onClose={checkout.close} />}
      {outcome && <PaymentResultDialog outcome={outcome} onClose={() => setOutcome(null)} onRetry={retry} />}
    </div>
  );
}
