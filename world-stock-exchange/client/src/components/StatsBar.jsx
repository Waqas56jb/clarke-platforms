import { money } from '../utils/format';

export default function StatsBar({ balance, portfolio }) {
  return (
    <section className="stats">
      <div className="stat">
        <small>Demo account balance</small>
        <strong id="balance">{money(balance)}</strong>
      </div>
      <div className="stat">
        <small>Demo portfolio value</small>
        <strong id="portfolio">{money(portfolio)}</strong>
      </div>
      <div className="stat">
        <small>Illustrative markets</small>
        <strong>12</strong>
      </div>
      <div className="stat">
        <small>Live trading</small>
        <strong style={{ color: 'var(--gold)' }}>Coming later</strong>
      </div>
    </section>
  );
}
