// Payments planned, security and business model sections, word for word from the original page.
const SECURITY_POINTS = [
  'Encrypted connections and protected data storage',
  'Multi-factor authentication',
  'Identity verification and anti-money-laundering checks',
  'Withdrawal risk checks and account alerts',
  'Independent security testing and incident response',
  'Segregation and safeguarding of client assets where required',
];

const REVENUE = [
  ['Trading fees', 'Transparent commissions on eligible completed trades.'],
  ['Listing services', 'Fees for approved issuers and product listings.'],
  ['Premium services', 'Optional market tools, research and institutional services.'],
];

export function PaymentsPanel() {
  return (
    <section className="panel" id="payments" aria-labelledby="paymentsTitle">
      <div className="eyebrow">FUNDING &amp; PAYOUTS</div>
      <h2 id="paymentsTitle">Payment options planned</h2>
      <p className="muted">
        Visa and Mastercard credit/debit card funding may be offered through an approved acquiring bank or payment
        service provider, subject to their underwriting and the rules in each supported country.
      </p>
      <div className="pill-row">
        <span className="pill">VISA</span>
        <span className="pill">MASTERCARD</span>
        <span className="pill">DEBIT CARDS</span>
        <span className="pill">BANK TRANSFER</span>
      </div>
      <p className="fine-print">
        Card processing is not connected in this prototype. Customer funds must not be collected until the regulated
        operating model, safeguarded fund arrangements and payment approvals are in place.
      </p>
    </section>
  );
}

export function SecurityPanel() {
  return (
    <section className="panel" id="security" aria-labelledby="securityTitle">
      <div className="eyebrow">TRUST BY DESIGN</div>
      <h2 id="securityTitle">End-to-end security</h2>
      <ul className="muted bullet-list">
        {SECURITY_POINTS.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </section>
  );
}

export function BusinessModel() {
  return (
    <section className="panel" aria-labelledby="businessTitle">
      <div className="eyebrow">BUSINESS MODEL</div>
      <h2 id="businessTitle">How WSE may generate revenue</h2>
      <div className="card-grid">
        {REVENUE.map(([title, text]) => (
          <div key={title}>
            <b>{title}</b>
            <p className="muted">{text}</p>
          </div>
        ))}
      </div>
      <p className="fine-print">
        Fees must be disclosed clearly and comply with applicable law. Customer returns are not guaranteed; investments
        can lose value.
      </p>
    </section>
  );
}
