// One of the issuer's own applications: status, review outcome, figures and documents.
import { MessageSquareText } from 'lucide-react';
import { count, formatDateTime, sharePrice } from '../../utils/format';
import CompanyMeta from '../listings/CompanyMeta';
import ShareProgress from '../listings/ShareProgress';
import DocumentManager from './DocumentManager';
import StatusBadge from './StatusBadge';

export function ReviewNote({ application: a }) {
  if (!a.reviewNote && !a.reviewedAt) return null;
  return (
    <div className="review-note">
      <MessageSquareText size={18} aria-hidden="true" />
      <div className="grow">
        <p className="caption">
          Reviewed{a.reviewedBy ? ` by ${a.reviewedBy}` : ''} · {formatDateTime(a.reviewedAt)}
        </p>
        {a.reviewNote && <p className="pre-line">{a.reviewNote}</p>}
      </div>
    </div>
  );
}

export default function ApplicationCard({ application: a, onDocumentsChange, onOpenListing }) {
  return (
    <article className="company-card application-card" aria-labelledby={`app-${a.id}`}>
      <div className="row-wrap">
        <StatusBadge status={a.status} />
        <span className="caption">{a.reference}</span>
      </div>
      <h3 id={`app-${a.id}`}>{a.name}</h3>
      <CompanyMeta company={a} />
      <dl className="detail-list compact">
        <div>
          <dt>Submitted</dt>
          <dd>{formatDateTime(a.createdAt)}</dd>
        </div>
        <div>
          <dt>Shares offered</dt>
          <dd>{count(a.shares)}</dd>
        </div>
        <div>
          <dt>Offer price</dt>
          <dd>{sharePrice(a.currency, a.price)}</dd>
        </div>
      </dl>
      {a.status === 'approved' && <ShareProgress remaining={a.remainingShares} total={a.shares} />}
      <ReviewNote application={a} />
      <DocumentManager application={a} onDocumentsChange={onDocumentsChange} />
      {a.status === 'approved' && (
        <button type="button" className="btn btn-secondary" onClick={() => onOpenListing(a.id)}>
          View public listing
        </button>
      )}
    </article>
  );
}
