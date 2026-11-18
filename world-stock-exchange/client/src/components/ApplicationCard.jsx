import { formatDateTime } from '../utils/format';
import CompanyMeta from './CompanyMeta';

const REVIEW_ACTIONS = [
  ['Approved', 'Approve for demo display'],
  ['Rejected', 'Reject'],
  ['Pending review', 'Return to pending'],
];

export default function ApplicationCard({ app: a, onReview }) {
  return (
    <article className="company-card">
      <div className="status">{a.status.toUpperCase()}</div>
      <h3>{a.name}</h3>
      <CompanyMeta app={a} />
      <p className="muted">
        Application: {a.id}
        <br />
        Submitted: {formatDateTime(a.createdAt)}
        <br />
        Shares offered: {Number(a.shares).toLocaleString()}
        <br />
        Documents selected: {a.files.length ? a.files.join(', ') : 'None'}
      </p>
      <p className="muted">{a.description}</p>
      <div>
        {REVIEW_ACTIONS.map(([status, label]) => (
          <button key={status} className="admin-action" type="button" onClick={() => onReview(a.id, status)}>
            {label}
          </button>
        ))}
      </div>
      <p className="file-note">Prototype review control only — not a secure administrator approval process.</p>
    </article>
  );
}
