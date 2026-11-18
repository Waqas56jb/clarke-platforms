import { ArrowLeft } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import CheckoutDialog from '../components/payments/CheckoutDialog';
import PlansSection from '../components/payments/PlansSection';
import { PlanStatus } from '../components/PlanStatus';
import { useCheckout } from '../hooks/useCheckout';

const CARDS = [
  {
    plan: 'dating_plus_monthly',
    eyebrow: 'More discovery',
    text: 'Up to 35 profiles per discovery page and a Dating Plus membership badge.',
    buttonLabel: 'Get Dating Plus',
  },
  {
    plan: 'dating_vip_monthly',
    eyebrow: 'Top tier',
    text: 'Up to 60 profiles per discovery page and a VIP membership badge.',
    buttonLabel: 'Get Dating VIP',
    recommended: true,
  },
];

export default function DatingPremiumPage() {
  const { navigate } = useNavigation();
  const checkout = useCheckout();
  return (
    <div className="plans-page">
      <button type="button" className="btn-link back-link" onClick={() => navigate('dating')}>
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Dating
      </button>
      <header className="page-header">
        <div>
          <h1>Clarke Dating memberships</h1>
          <p>Optional upgrades for people who want more ways to discover connections.</p>
        </div>
      </header>
      <PlanStatus />
      <section className="section" aria-label="Dating plans">
        <PlansSection cards={CARDS} onChoose={checkout.choose} columns={2} />
        <p className="fine-print">
          Prices are in US dollars. Checkout is handled by WiPay; your membership starts as soon as WiPay confirms the
          payment and lasts 30 days.
        </p>
      </section>
      {checkout.item && <CheckoutDialog item={checkout.item} onClose={checkout.close} />}
    </div>
  );
}
