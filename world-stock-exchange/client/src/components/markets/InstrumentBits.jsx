// Small pieces shared by every place that shows an instrument: price, day change and data label.
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ILLUSTRATIVE_LABEL, MARKET_LABEL, isMarketData } from '../../utils/markets';
import { formatDateTime, money, percent } from '../../utils/format';

export const instrumentPrice = (i) => (i.category === 'Currency' ? Number(i.price).toFixed(4) : money(i.price));

export function ChangeValue({ instrument: i }) {
  if (i.quoteBased) return <span className="muted">Quote-based</span>;
  const up = i.changePct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`change ${up ? 'up' : 'down'}`}>
      <Icon size={16} aria-hidden="true" />
      {percent(i.changePct)}
    </span>
  );
}

// "Illustrative data" unless the API says the price came from the market data provider.
export function DataLabel({ instrument: i }) {
  if (!isMarketData(i)) return <span className="pill">{ILLUSTRATIVE_LABEL}</span>;
  return (
    <span className="data-label">
      <span className="pill pill-market">{MARKET_LABEL}</span>
      {i.updatedAt && <span className="caption">Updated {formatDateTime(i.updatedAt)}</span>}
    </span>
  );
}

export const categoryLine = (i) => `${i.category}${i.sector ? ` · ${i.sector}` : ''}`;
