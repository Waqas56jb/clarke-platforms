import PaymentCard from '../components/PaymentCard';
import ViewHeading from '../components/ViewHeading';
import { useAsync } from '../hooks/useAsync';
import { useCheckout } from '../hooks/useCheckout';
import { paymentConfig } from '../services/paymentsService';
import { money } from '../utils/format';
import { ConfigNotice, PlanStatus } from '../components/PlanStatus';

export default function DatingPremiumPage() {
  const checkout = useCheckout();
  const config = useAsync(() => paymentConfig(), []);
  const priceOf = (plan) => {
    const p = config.data?.plans.find((x) => x.key === plan);
    return p ? money(p.amount, p.currency) : '…';
  };
  return (
    <>
      <ViewHeading
        title="Clarke Dating memberships"
        subtitle="Optional upgrades for people who want more ways to discover connections."
      />
      <PlanStatus />
      <ConfigNotice config={config.data} />
      <div className="payment-grid">
        <PaymentCard
          eyebrow="MORE DISCOVERY"
          title="Dating Plus"
          price={priceOf('dating_plus_monthly')}
          period="/ 30 days"
          text="Up to 35 profiles per discovery page and a Dating Plus membership badge."
          buttonLabel="Get Dating Plus"
          onPay={() => checkout('dating_plus_monthly')}
        />
        <PaymentCard
          eyebrow="TOP TIER"
          title="Dating VIP"
          price={priceOf('dating_vip_monthly')}
          period="/ 30 days"
          text="Up to 60 profiles per discovery page and a VIP membership badge."
          buttonLabel="Get Dating VIP"
          featured
          onPay={() => checkout('dating_vip_monthly')}
        />
      </div>
      <p className="fine-print">
        Prices are in US dollars. Checkout is handled by WiPay; your membership starts as soon as WiPay confirms the
        payment and lasts 30 days.
      </p>
    </>
  );
}
