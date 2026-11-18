import { Crown, FlaskConical, TriangleAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PLAN_NAMES } from '../utils/format';

export const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

// Rows for each active plan with its expiry date.
export function ActivePlans({ plans }) {
  return (
    <ul className="plan-list">
      {plans.map((p) => (
        <li className="list-row" key={p.planKey}>
          <span className="plan-list-icon" aria-hidden="true">
            <Crown size={20} />
          </span>
          <span className="list-row-main">
            <span className="list-row-title">{PLAN_NAMES[p.planKey] || p.planKey}</span>
            <span className="list-row-sub">Active until {formatDate(p.expiresAt)}</span>
          </span>
          <span className="badge badge-success">Active</span>
        </li>
      ))}
    </ul>
  );
}

export function PlanStatus() {
  const { plans } = useAuth();
  if (!plans.length) return null;
  return (
    <section className="card card-pad plan-status" aria-labelledby="planStatusTitle">
      <h2 className="card-title" id="planStatusTitle">
        Your active plans
      </h2>
      <ActivePlans plans={plans} />
    </section>
  );
}

export function ConfigNotice({ config }) {
  if (!config) return null;
  if (!config.enabled)
    return (
      <p className="notice notice-warning">
        <TriangleAlert size={18} aria-hidden="true" />
        <span>Payments are not configured yet, so checkout is unavailable.</span>
      </p>
    );
  if (config.environment === 'sandbox')
    return (
      <p className="notice">
        <FlaskConical size={18} aria-hidden="true" />
        <span>Test mode: payments use the WiPay sandbox and no real money is taken.</span>
      </p>
    );
  return null;
}
