import { remainingOf } from '../utils/format';
import CompanyMeta from './CompanyMeta';

export default function ListingCard({ app: a, onSelect }) {
  return (
    <article className="company-card">
      <div className="status">APPROVED · DEMO LISTING</div>
      <h3>{a.name}</h3>
      <CompanyMeta app={a} />
      <p className="muted">{a.description}</p>
      <div className="price">
        {a.currency} {Number(a.price).toFixed(4)}
      </div>
      <p className="muted">
        {remainingOf(a).toLocaleString()} shares available · {a.shareClass}
      </p>
      <button className="buy" type="button" onClick={() => onSelect(a.id)}>
        View buying ticket
      </button>
    </article>
  );
}
