import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { paymentConfig } from '../../services/paymentsService';
import { ErrorState, Loading } from '../StateView';
import PaymentCard from '../PaymentCard';
import { ConfigNotice } from '../PlanStatus';

// Plan cards built from the payments API. `cards` supplies the copy for each plan key, in display order.
export default function PlansSection({ cards, onChoose, columns = 3 }) {
  const { plans: active } = useAuth();
  const config = useAsync(() => paymentConfig(), []);

  if (config.loading && !config.data)
    return <Loading variant="card" count={cards.length} grid="240px" text="Loading plans" />;
  if (config.error && !config.data)
    return <ErrorState title="Couldn't load plans" message={config.error} onRetry={config.reload} />;

  const byKey = new Map(config.data.plans.map((p) => [p.key, p]));
  return (
    <div className="stack">
      <ConfigNotice config={config.data} />
      <div className={`plan-grid plan-grid-${columns}`}>
        {cards
          .filter((card) => byKey.has(card.plan))
          .map(({ plan: key, ...card }) => {
            const plan = byKey.get(key);
            return (
              <PaymentCard
                key={key}
                plan={plan}
                {...card}
                active={active.find((p) => p.planKey === key)}
                disabled={!config.data.enabled}
                onChoose={() =>
                  onChoose({
                    payload: { plan: key },
                    name: plan.name,
                    amount: plan.amount,
                    currency: plan.currency,
                    term: plan.interval ? '30 days of access' : 'One-time payment',
                  })
                }
              />
            );
          })}
      </div>
    </div>
  );
}
