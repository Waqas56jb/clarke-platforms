const SECURITY_POINTS = [
  'Encrypted connections and protected data storage',
  'Multi-factor authentication',
  'Identity verification and anti-money-laundering checks',
  'Withdrawal risk checks and account alerts',
  'Independent security testing and incident response',
  'Segregation and safeguarding of client assets where required',
];

export default function PaymentsSecuritySection() {
  return (
    <section className="layout" id="payments">
      <div className="panel">
        <div className="eyebrow">FUNDING &amp; PAYOUTS</div>
        <h2>Payment options planned</h2>
        <p className="muted">
          Visa and Mastercard credit/debit card funding may be offered through an approved acquiring bank or payment
          service provider, subject to their underwriting and the rules in each supported country.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '18px 0' }}>
          <span className="pill">VISA</span>
          <span className="pill">MASTERCARD</span>
          <span className="pill">DEBIT CARDS</span>
          <span className="pill">BANK TRANSFER</span>
        </div>
        <p className="muted" style={{ fontSize: 12 }}>
          Card processing is not connected in this prototype. Customer funds must not be collected until the regulated
          operating model, safeguarded fund arrangements and payment approvals are in place.
        </p>
      </div>
      <div className="panel" id="security">
        <div className="eyebrow">TRUST BY DESIGN</div>
        <h2>End-to-end security</h2>
        <ul className="muted" style={{ paddingLeft: 18 }}>
          {SECURITY_POINTS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
