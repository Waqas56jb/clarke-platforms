import { useAuth } from '../context/AuthContext';
import { PLAN_NAMES } from '../utils/format';

export function PlanStatus() {
  const { plans } = useAuth();
  if (!plans.length) return null;
  return (
    <div className="dating-intro">
      <b>Your active plans</b>
      <span>
        {plans.map((p) => `${PLAN_NAMES[p.planKey]} until ${new Date(p.expiresAt).toLocaleDateString()}`).join(' · ')}
      </span>
    </div>
  );
}

export function ConfigNotice({ config }) {
  if (!config) return null;
  if (!config.enabled)
    return <p className="inline-error">Payments are not configured yet, so checkout is unavailable.</p>;
  if (config.environment === 'sandbox')
    return <p className="fine-print">Test mode: payments use the WiPay sandbox and no real money is taken.</p>;
  return null;
}
