// Reviewer screen: applications filtered by status (with counts), a detail panel and decisions.
import { useState } from 'react';
import { ArrowLeft, ClipboardCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useAsync } from '../hooks/useAsync';
import { DESKTOP_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { fetchReviewApplications } from '../services/reviewService';
import StatusBadge from '../components/issuer/StatusBadge';
import ReviewDetail from '../components/review/ReviewDetail';
import PageHeader from '../components/site/PageHeader';
import RequireAuth from '../components/site/RequireAuth';
import { AsyncView, EmptyState } from '../components/StateView';
import { formatDate } from '../utils/format';

const FILTERS = [
  ['all', 'All'],
  ['pending', 'Pending'],
  ['approved', 'Approved'],
  ['rejected', 'Rejected'],
];

function ApplicationList({ applications, selectedId, onSelect }) {
  if (!applications.length) return <EmptyState icon={ClipboardCheck} plain title="No applications here." />;
  return (
    <ul className="review-list" aria-label="Applications">
      {applications.map((a) => (
        <li key={a.id}>
          <button
            type="button"
            className={`review-item${a.id === selectedId ? ' active' : ''}`}
            aria-current={a.id === selectedId ? 'true' : undefined}
            onClick={() => onSelect(a.id)}
          >
            <span className="row-wrap">
              <StatusBadge status={a.status} />
              <span className="caption">{a.reference}</span>
            </span>
            <span className="cell-title">{a.name}</span>
            <span className="caption">
              {a.symbol} · {a.issuerName || 'Issuer'} · {formatDate(a.createdAt)} · {a.documents.length} document(s)
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Review() {
  const { params, syncUrl } = useNavigation();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const state = useAsync(fetchReviewApplications, []);
  const [status, setStatus] = useState(FILTERS.some(([k]) => k === params.status) ? params.status : 'all');
  const [selectedId, setSelectedId] = useState(params.id);

  const update = (next) => {
    syncUrl('review', { status: next.status === 'all' ? undefined : next.status, id: next.id });
  };
  const chooseStatus = (key) => {
    setStatus(key);
    update({ status: key, id: selectedId });
  };
  const select = (id) => {
    setSelectedId(id);
    update({ status, id });
    if (!desktop) window.scrollTo({ top: 0 });
  };
  const replace = (app) =>
    state.setData((d) => ({ ...d, applications: d.applications.map((a) => (a.id === app.id ? app : a)) }));

  return (
    <AsyncView state={state} count={3} loadingText="Loading applications">
      {(d) => {
        const counts = Object.fromEntries(
          FILTERS.map(([k]) => [
            k,
            k === 'all' ? d.applications.length : d.applications.filter((a) => a.status === k).length,
          ])
        );
        const shown = status === 'all' ? d.applications : d.applications.filter((a) => a.status === status);
        const selected = d.applications.find((a) => a.id === selectedId);
        const showList = desktop || !selected;
        return (
          <div className="review-layout">
            {showList && (
              <div className="stack-sm">
                <div className="tabs" role="tablist" aria-label="Filter by status">
                  {FILTERS.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      className="tab"
                      aria-selected={status === key}
                      onClick={() => chooseStatus(key)}
                    >
                      {label}
                      <span className="count-badge">{counts[key]}</span>
                    </button>
                  ))}
                </div>
                <ApplicationList applications={shown} selectedId={selectedId} onSelect={select} />
              </div>
            )}
            {selected ? (
              <div className="stack-sm">
                {!desktop && (
                  <button type="button" className="btn btn-ghost back-link" onClick={() => select(undefined)}>
                    <ArrowLeft size={18} aria-hidden="true" />
                    All applications
                  </button>
                )}
                <ReviewDetail application={selected} onDecided={replace} />
              </div>
            ) : (
              desktop && <EmptyState icon={ClipboardCheck} title="Select an application to review it." />
            )}
          </div>
        );
      }}
    </AsyncView>
  );
}

function ReviewerGate() {
  const { hasRole } = useAuth();
  if (!hasRole('reviewer'))
    return (
      <EmptyState icon={Lock} title="No access">
        Only listing reviewers can open this screen. Reviewer access is granted by the exchange, not from the website.
      </EmptyState>
    );
  return <Review />;
}

export default function ReviewPage() {
  return (
    <div className="stack">
      <PageHeader eyebrow="LISTING REVIEW" title="Review applications">
        Check each company&apos;s details and documents, then approve, reject or return it to pending with a note. Every
        decision is recorded with the reviewer and time.
      </PageHeader>
      <RequireAuth title="Sign in to review applications">
        <ReviewerGate />
      </RequireAuth>
    </div>
  );
}
