import PaymentCard from '../components/PaymentCard';
import ViewHeading from '../components/ViewHeading';
import { useCheckout } from '../hooks/useCheckout';

export default function DatingPremiumPage() {
  const checkout = useCheckout();
  return (
    <>
      <ViewHeading
        title="Clarke Dating memberships"
        subtitle="Optional upgrades for people who want more ways to discover connections."
      />
      <div className="payment-grid">
        <PaymentCard
          eyebrow="MORE DISCOVERY"
          title="Dating Plus"
          price="£9.99"
          period="/ month"
          text="Up to 35 profiles per discovery page and a Dating Plus membership badge."
          buttonLabel="Get Dating Plus"
          onPay={() => checkout('dating_plus_monthly')}
        />
        <PaymentCard
          eyebrow="TOP TIER"
          title="Dating VIP"
          price="£19.99"
          period="/ month"
          text="Up to 60 profiles per discovery page and a VIP membership badge."
          buttonLabel="Get Dating VIP"
          featured
          onPay={() => checkout('dating_vip_monthly')}
        />
      </div>
      <p className="fine-print">
        Prices are proposed GBP prices. Checkout is available only after the owner configures Stripe. A subscription is
        activated after a verified Stripe webhook.
      </p>
    </>
  );
}
