import { remainingOf } from '../utils/format';

export default function BuyingCard({ app: a, onSelect }) {
  return (
    <article className="buying-card">
      <div className="type">
        {a.sector.toUpperCase()} · {a.symbol}
      </div>
      <h3>{a.name}</h3>
      <p className="muted">
        {a.country} · {a.shareClass}
      </p>
      <div className="price">
        {a.currency} {Number(a.price).toFixed(4)}{' '}
        <span className="muted" style={{ fontSize: 12 }}>
          per share
        </span>
      </div>
      <p className="muted">{remainingOf(a).toLocaleString()} shares available</p>
      <button className="buy" type="button" onClick={() => onSelect(a.id)}>
        Select to buy
      </button>
    </article>
  );
}
