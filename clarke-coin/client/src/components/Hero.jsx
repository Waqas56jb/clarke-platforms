export default function Hero() {
  return (
    <section className="hero">
      <div>
        <div className="eyebrow">Trade • Invest • Prosper</div>
        <h2>CLARKE COIN</h2>
        <h3>The proposed digital asset exchange</h3>
        <p>
          A black-and-gold exchange concept for buying, selling and following Clarke Coin. The proposed initial listing
          price is £300 GBP; after launch, completed trades would determine the market price.
        </p>
        <a className="btn" href="#trade">
          Explore trading layout →
        </a>
      </div>
      <div className="hero-price">
        <div className="muted">PROPOSED INITIAL LISTING PRICE</div>
        <div className="price">£300.00</div>
        <div className="positive">Market price: not live yet</div>
        <hr style={{ borderColor: '#51401e' }} />
        <div className="muted">PLANNED MAXIMUM / INITIAL SUPPLY</div>
        <div className="stat">2,000,000,000 CC</div>
        <div className="notice">Concept figures only. No coins are being offered or traded on this demo page.</div>
      </div>
    </section>
  );
}
