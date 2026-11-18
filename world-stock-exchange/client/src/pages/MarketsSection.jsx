import { useState } from 'react';
import MarketCard from '../components/MarketCard';
import { MARKET_TABS, filterAssets } from '../utils/marketData';

export default function MarketsSection() {
  const [category, setCategory] = useState('All');
  return (
    <section id="markets">
      <div className="section-head">
        <div>
          <div className="eyebrow">MARKETPLACE</div>
          <h2>Explore asset classes</h2>
        </div>
        <div className="tabs">
          {MARKET_TABS.map(([value, label]) => (
            <button
              key={value}
              className={`tab${category === value ? ' active' : ''}`}
              onClick={() => setCategory(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid" id="marketGrid">
        {filterAssets(category).map((a) => (
          <MarketCard key={a.name} asset={a} />
        ))}
      </div>
    </section>
  );
}
