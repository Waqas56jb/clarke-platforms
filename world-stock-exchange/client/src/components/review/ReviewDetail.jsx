// Every field of an application, its documents, review history and the decision controls.
import { Download, FileText } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { openDocument } from '../../services/issuerService';
import { DOCUMENT_KINDS } from '../../utils/documents';
import { count, fileSize, formatDateTime, sharePrice } from '../../utils/format';
import StatusBadge from '../issuer/StatusBadge';
import ReviewActions from './ReviewActions';

const KIND_LABELS = Object.fromEntries(DOCUMENT_KINDS);

function Documents({ application: a }) {
  const toast = useToast();
  if (!a.documents.length) return <p className="caption">No documents uploaded.</p>;
  return (
    <ul className="doc-files">
      {a.documents.map((d) => (
        <li key={d.id} className="doc-file">
          <FileText size={20} aria-hidden="true" />
          <span className="grow">
            <span className="doc-name">{d.name}</span>
            <span className="caption">
              {KIND_LABELS[d.kind] || d.kindLabel} · {fileSize(d.size)} · {formatDateTime(d.uploadedAt)}
            </span>
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            aria-label={`Download ${d.name}`}
            onClick={() => openDocument(a.id, d.id).catch((e) => toast(e.message, 'error'))}
          >
            <Download size={16} aria-hidden="true" />
            Download
          </button>
        </li>
      ))}
    </ul>
  );
}

function History({ reviews }) {
  if (!reviews.length) return <p className="caption">No decisions yet.</p>;
  return (
    <ol className="review-history">
      {reviews.map((r, i) => (
        <li key={`${r.at}-${i}`}>
          <div className="row-wrap">
            <StatusBadge status={r.status} />
            <span className="caption">
              {r.reviewer || 'Reviewer'} · {formatDateTime(r.at)}
            </span>
          </div>
          {r.note && <p className="pre-line">{r.note}</p>}
        </li>
      ))}
    </ol>
  );
}

export default function ReviewDetail({ application: a, onDecided }) {
  const rows = [
    ['Reference', a.reference],
    ['Issuer account', a.issuerName || '—'],
    ['Registered company name', a.name],
    ['Country of incorporation', a.country],
    ['Proposed ticker / share symbol', a.symbol],
    ['Industry / sector', a.sector],
    ['Authorized contact email', a.email],
    ['Share class', a.shareClass],
    ['Number of shares offered', count(a.shares)],
    ['Shares remaining', count(a.remainingShares)],
    ['Proposed offer price per share', sharePrice(a.currency, a.price)],
    ['Submitted', formatDateTime(a.createdAt)],
  ];
  return (
    <article className="panel stack" aria-labelledby="reviewDetailTitle">
      <div>
        <div className="row-wrap">
          <StatusBadge status={a.status} />
          <span className="caption">{a.reference}</span>
        </div>
        <h2 id="reviewDetailTitle">{a.name}</h2>
      </div>
      <dl className="detail-list">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        <div>
          <dt>Company website</dt>
          <dd>
            {a.website ? (
              <a href={a.website} target="_blank" rel="noopener noreferrer">
                {a.website}
              </a>
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div>
          <dt>Company profile and business description</dt>
          <dd className="pre-line">{a.description}</dd>
        </div>
      </dl>
      <section aria-labelledby="reviewDocsTitle" className="stack-sm">
        <h3 id="reviewDocsTitle" className="card-title">
          Documents
        </h3>
        <Documents application={a} />
      </section>
      <section aria-labelledby="reviewHistoryTitle" className="stack-sm">
        <h3 id="reviewHistoryTitle" className="card-title">
          Review history
        </h3>
        <History reviews={a.reviews} />
      </section>
      <ReviewActions key={a.id} application={a} onDecided={onDecided} />
    </article>
  );
}
