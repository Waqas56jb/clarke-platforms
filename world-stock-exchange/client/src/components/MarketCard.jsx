import { money } from '../utils/format';

export default function MarketCard({ asset: a }) {
  return (
    <article className="market-card">
      <div className="type">
        {a.category.toUpperCase()}
        {a.sector ? ' · ' + a.sector.toUpperCase() : ''}
      </div>
      <h3>{a.name}</h3>
      <div className="price">{a.category === 'Currency' ? a.price.toFixed(4) : money(a.price)}</div>
      <div className={`change ${a.up ? 'up' : 'down'}`}>{a.change}</div>
      <div style={{ marginTop: 13 }}>
        <span className="pill">Illustrative data</span>
      </div>
    </article>
  );
}
