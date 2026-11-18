import { useState } from 'react';
import { ASSETS } from '../utils/marketData';
import { money } from '../utils/format';

const TRADABLE = ASSETS.map((a, index) => ({ a, index })).filter(({ a }) => a.category !== 'Goods');

export default function TradeSection({ trading }) {
  const [assetIndex, setAssetIndex] = useState('0');
  const [quantity, setQuantity] = useState('1');
  const asset = ASSETS[+assetIndex || 0];
  const q = Math.max(0, +quantity || 0);

  return (
    <section className="layout" id="trade">
      <div className="panel">
        <div className="eyebrow">WATCHLIST</div>
        <h2>Market overview</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Category</th>
              <th>Demo price</th>
              <th>Day</th>
            </tr>
          </thead>
          <tbody id="watchRows">
            {ASSETS.slice(0, 15).map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.category}</td>
                <td>{a.price}</td>
                <td className={a.up ? 'change up' : 'change down'}>{a.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="panel">
        <div className="eyebrow">PRACTICE ONLY</div>
        <h2>Demo trade ticket</h2>
        <label htmlFor="asset">Select instrument</label>
        <select id="asset" value={assetIndex} onChange={(e) => setAssetIndex(e.target.value)}>
          {TRADABLE.map(({ a, index }) => (
            <option key={a.name} value={index}>
              {a.name}
            </option>
          ))}
        </select>
        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          type="number"
          min="0.01"
          step="0.01"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <div className="trade-row">
          <span className="muted">Estimated order value</span>
          <b id="estimate">{money(asset.price * q)}</b>
        </div>
        <div className="actions">
          <button className="buy" onClick={() => trading.trade('buy', asset, q)}>
            Demo buy
          </button>
          <button className="sell" onClick={() => trading.trade('sell', asset, q)}>
            Demo sell
          </button>
        </div>
        <p className="muted" id="tradeMessage" style={{ fontSize: 12 }}>
          {trading.message}
        </p>
      </div>
    </section>
  );
}
