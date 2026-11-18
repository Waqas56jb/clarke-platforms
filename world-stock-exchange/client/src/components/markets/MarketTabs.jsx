import { MARKET_TABS } from '../../utils/markets';

export default function MarketTabs({ value, onChange }) {
  return (
    <div className="chip-row market-tabs" role="group" aria-label="Filter markets by category">
      {MARKET_TABS.map(([key, label]) => (
        <button key={key} type="button" className="chip" aria-pressed={value === key} onClick={() => onChange(key)}>
          {label}
        </button>
      ))}
    </div>
  );
}
