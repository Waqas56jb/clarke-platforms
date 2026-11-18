import { ArrowLeft } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useAsync } from '../hooks/useAsync';
import { fetchListing } from '../services/listingsService';
import BuyTicket from '../components/listings/BuyTicket';
import CompanyMeta from '../components/listings/CompanyMeta';
import ShareProgress from '../components/listings/ShareProgress';
import PageHeader from '../components/site/PageHeader';
import { ErrorState, Loading } from '../components/StateView';
import { count, formatDate, sharePrice } from '../utils/format';

function Details({ listing: l }) {
  const rows = [
    ['Reference', l.reference],
    ['Country of incorporation', l.country],
    ['Industry / sector', l.sector],
    ['Share class', l.shareClass],
    ['Shares offered', count(l.shares)],
    ['Shares remaining', count(l.remainingShares)],
    ['Offer price per share', sharePrice(l.currency, l.price)],
    ['Approved', formatDate(l.approvedAt)],
  ];
  return (
    <section className="panel stack" aria-labelledby="listingAbout">
      <div>
        <div className="status">APPROVED · DEMO LISTING</div>
        <h2 id="listingAbout">About {l.name}</h2>
        <CompanyMeta company={l} />
        <p className="muted pre-line">{l.description}</p>
      </div>
      <ShareProgress remaining={l.remainingShares} total={l.shares} />
      <dl className="detail-list">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        {l.website && (
          <div>
            <dt>Company website</dt>
            <dd>
              <a href={l.website} target="_blank" rel="noopener noreferrer">
                {l.website}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

export default function ListingPage() {
  const { params, navigate } = useNavigation();
  const state = useAsync(() => fetchListing(params.id), [params.id]);
  const back = (
    <button type="button" className="btn btn-ghost back-link" onClick={() => navigate('listings')}>
      <ArrowLeft size={18} aria-hidden="true" />
      All listings
    </button>
  );

  if (state.loading && !state.data) return <Loading count={2} text="Loading listing" />;
  if (state.error && !state.data)
    return (
      <div className="stack">
        {back}
        <ErrorState title="Listing unavailable" message={state.error} onRetry={state.reload} />
      </div>
    );

  const l = state.data.listing;
  const onBought = (listing) => (listing ? state.setData(() => ({ listing })) : state.reload());
  return (
    <div className="stack">
      {back}
      <PageHeader eyebrow={`${l.sector.toUpperCase()} · ${l.symbol}`} title={l.name}>
        {l.country} · {l.shareClass}
      </PageHeader>
      <div className="layout-split">
        <Details listing={l} />
        <BuyTicket listing={l} onBought={onBought} />
      </div>
    </div>
  );
}
