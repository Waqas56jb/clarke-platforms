// Approve / reject / return to pending with a note → POST /api/review/applications/:id/decision.
import { useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { decideApplication } from '../../services/reviewService';
import { useConfirm } from '../ui/ConfirmDialog';

const ACTIONS = [
  {
    status: 'approved',
    id: 'reviewApprove',
    label: 'Approve for demo display',
    icon: Check,
    className: 'btn-buy',
    confirm: 'Approve this listing?',
    message: 'The company and its offering become public in Company listings, and investors can place practice orders.',
    done: 'Application approved. The listing is now public.',
  },
  {
    status: 'rejected',
    id: 'reviewReject',
    label: 'Reject',
    icon: X,
    className: 'btn-danger',
    confirm: 'Reject this application?',
    message: 'The issuer will see your note. A rejected application is not public.',
    done: 'Application rejected.',
  },
  {
    status: 'pending',
    id: 'reviewPending',
    label: 'Return to pending',
    icon: RotateCcw,
    className: 'btn-secondary',
    confirm: 'Return this application to pending?',
    message: 'It is removed from public listings (if approved) and the issuer can change its documents again.',
    done: 'Application returned to pending.',
  },
];

export default function ReviewActions({ application, onDecided }) {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const decide = async (action) => {
    setError('');
    if (action.status !== 'approved' && !note.trim()) {
      setError('Add a note explaining this decision for the issuer.');
      return;
    }
    const ok = await confirm({
      title: action.confirm,
      message: action.message,
      confirmLabel: action.label,
      danger: action.status === 'rejected',
    });
    if (!ok) return;
    setBusy(true);
    try {
      const r = await decideApplication(application.id, action.status, note.trim());
      onDecided(r.application);
      setNote('');
      toast(action.done, 'success');
    } catch (e) {
      setError(e.message);
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="review-actions stack-sm" aria-labelledby="decisionTitle">
      <h3 id="decisionTitle" className="card-title">
        Decision
      </h3>
      <div className="field">
        <label className="field-label" htmlFor="reviewNote">
          Note for the issuer (required to reject or return to pending)
        </label>
        <textarea
          id="reviewNote"
          rows={3}
          maxLength={1000}
          value={note}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'reviewError' : undefined}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div role="alert" id="reviewError">
        {error && <p className="field-error">{error}</p>}
      </div>
      <div className="row-wrap">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.status}
              type="button"
              id={action.id}
              className={`btn ${action.className}`}
              disabled={busy || application.status === action.status}
              onClick={() => decide(action)}
            >
              <Icon size={18} aria-hidden="true" />
              {action.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
