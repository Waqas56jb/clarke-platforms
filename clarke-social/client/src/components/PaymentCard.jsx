import { Check } from 'lucide-react';
import { money } from '../utils/format';
import { formatDate } from './PlanStatus';

// One plan from the payments API. `active` is the member's current plan record, if any.
export default function PaymentCard({ plan, eyebrow, text, buttonLabel, recommended, active, disabled, onChoose }) {
  const recurring = Boolean(plan.interval);
  return (
    <article className={`card plan-card${recommended ? ' recommended' : ''}`} aria-labelledby={`plan-${plan.key}`}>
      <div className="plan-card-top">
        <span className="plan-eyebrow">{eyebrow}</span>
        {recommended && <span className="badge">Recommended</span>}
      </div>
      <h2 className="plan-card-title" id={`plan-${plan.key}`}>
        {plan.name}
      </h2>
      <p className="plan-price">
        <span className="plan-amount">{money(plan.amount, plan.currency)}</span>
        <span className="plan-interval">{recurring ? 'per 30 days' : 'one-time'}</span>
      </p>
      <p className="plan-text">{text}</p>
      {active && (
        <p className="plan-active">
          <Check size={16} aria-hidden="true" />
          Active until {formatDate(active.expiresAt)}
        </p>
      )}
      <button type="button" className="btn btn-primary plan-button" onClick={onChoose} disabled={disabled}>
        {disabled ? 'Checkout unavailable' : active ? 'Add 30 more days' : buttonLabel}
      </button>
    </article>
  );
}
