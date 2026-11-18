const REVENUE = [
  ['Trading fees', 'Transparent commissions on eligible completed trades.'],
  ['Listing services', 'Fees for approved issuers and product listings.'],
  ['Premium services', 'Optional market tools, research and institutional services.'],
];

export default function BusinessModelSection() {
  return (
    <section className="panel" style={{ marginTop: 18 }}>
      <div className="eyebrow">BUSINESS MODEL</div>
      <h2>How WSE may generate revenue</h2>
      <div className="grid">
        {REVENUE.map(([title, text]) => (
          <div key={title}>
            <b>{title}</b>
            <p className="muted">{text}</p>
          </div>
        ))}
      </div>
      <p className="muted" style={{ fontSize: 12 }}>
        Fees must be disclosed clearly and comply with applicable law. Customer returns are not guaranteed; investments
        can lose value.
      </p>
    </section>
  );
}
