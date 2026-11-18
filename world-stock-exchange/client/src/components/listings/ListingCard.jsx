import { sharePrice } from '../../utils/format';
import CompanyMeta from './CompanyMeta';
import ShareProgress from './ShareProgress';

export default function ListingCard({ listing: l, onOpen }) {
  const soldOut = l.remainingShares < 1;
  return (
    <article className="company-card">
      <div className="status">APPROVED · DEMO LISTING</div>
      <h3>{l.name}</h3>
      <CompanyMeta company={l} />
      <p className="muted clamp-3">{l.description}</p>
      <div className="price">
        {sharePrice(l.currency, l.price)} <span className="muted price-unit">per share · {l.shareClass}</span>
      </div>
      <ShareProgress remaining={l.remainingShares} total={l.shares} />
      <button type="button" className={`btn ${soldOut ? 'btn-secondary' : 'btn-buy'}`} onClick={() => onOpen(l.id)}>
        {soldOut ? 'Sold out · view listing' : 'View buying ticket'}
      </button>
    </article>
  );
}
