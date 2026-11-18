import { useNavigation } from '../../context/NavigationContext';

export default function Hero() {
  const { navigate } = useNavigation();
  return (
    <section className="hero" aria-labelledby="heroTitle">
      <div className="hero-text">
        <div className="eyebrow">ONE PLATFORM. GLOBAL MARKETS.</div>
        <h1 id="heroTitle">
          Trade the world&apos;s
          <br />
          <span className="hero-accent">opportunities.</span>
        </h1>
        <p>
          A proposed international marketplace for eligible company shares, currencies, energy markets, agricultural
          commodities and approved goods-trading opportunities.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn btn-accent" onClick={() => navigate('markets')}>
            Explore markets
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('info')}>
            Our security approach
          </button>
        </div>
      </div>
      <div className="hero-card">
        <span className="pill">DEMO PLATFORM</span>
        <h3>Your global market dashboard</h3>
        <div className="big">24/7</div>
        <div className="muted">
          Market access depends on the asset, exchange hours, jurisdiction and approved service providers.
        </div>
        <hr />
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
          <b className="gold-text">Not live</b>
        </div>
      </div>
    </section>
  );
}
