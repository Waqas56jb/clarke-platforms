import { ChangeValue, DataLabel, instrumentPrice } from './InstrumentBits';

export default function MarketCard({ instrument: i, onOpen }) {
  return (
    <article className="market-card">
      <div className="type">
        {i.category.toUpperCase()}
        {i.sector ? ` · ${i.sector.toUpperCase()}` : ''}
      </div>
      <h3>
        <button type="button" className="link-button" onClick={() => onOpen(i)}>
          {i.name}
        </button>
      </h3>
      <div className="price">{instrumentPrice(i)}</div>
      <ChangeValue instrument={i} />
      <div className="market-card-foot">
        <DataLabel instrument={i} />
      </div>
    </article>
  );
}
