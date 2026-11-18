export default function Hero() {
  return (
    <section className="hero">
      <div>
        <div className="eyebrow">ONE PLATFORM. GLOBAL MARKETS.</div>
        <h1>
          Trade the world&apos;s
          <br />
          <span style={{ color: 'var(--gold)' }}>opportunities.</span>
        </h1>
        <p>
          A proposed international marketplace for eligible company shares, currencies, energy markets, agricultural
          commodities and approved goods-trading opportunities.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
          <a
            className="gold"
            style={{ padding: '12px 18px', borderRadius: 8, color: '#101a26', fontWeight: 800 }}
            href="#markets"
          >
            Explore markets
          </a>
          <a className="outline" style={{ padding: '12px 18px', borderRadius: 8 }} href="#security">
            Our security approach
          </a>
        </div>
      </div>
      <div className="hero-card">
        <span className="pill">DEMO PLATFORM</span>
        <h3 style={{ marginTop: 16 }}>Your global market dashboard</h3>
        <div className="big">24/7</div>
        <div className="muted">
          Market access depends on the asset, exchange hours, jurisdiction and approved service providers.
        </div>
        <hr style={{ borderColor: 'var(--line)', margin: '20px 0' }} />
        <div className="trade-row">
          <span className="muted">Markets planned</span>
          <b>5 categories</b>
        </div>
        <div className="trade-row">
          <span className="muted">Payment methods planned</span>
          <b>Visa · Mastercard</b>
        </div>
        <div className="trade-row">
          <span className="muted">Trading status</span>
          <b style={{ color: 'var(--gold)' }}>Not live</b>
        </div>
      </div>
    </section>
  );
}
