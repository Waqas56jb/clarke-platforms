// Market summary, recent transactions and administration panels.
export default function OverviewSection() {
  return (
    <section className="lower">
      <div className="panel">
        <h3>MARKET SUMMARY</h3>
        <div className="feature">
          <span className="icon">◎</span>
          <div>
            Proposed initial price
            <br />
            <b>£300.00 GBP</b>
          </div>
        </div>
        <div className="feature">
          <span className="icon">◈</span>
          <div>
            Planned coin supply
            <br />
            <b>2,000,000,000 CC</b>
          </div>
        </div>
        <div className="feature">
          <span className="icon">↗</span>
          <div>
            24-hour volume
            <br />
            <b>Not available yet</b>
          </div>
        </div>
      </div>
      <div className="panel" id="history">
        <h3>RECENT TRANSACTIONS</h3>
        <p>No transactions yet.</p>
        <div className="muted">
          Trade history will appear here after a real exchange is deployed and trading is authorized.
        </div>
      </div>
      <div className="panel" id="admin">
        <h3>ADMINISTRATION</h3>
        <p>Restricted tools for authorized administrators.</p>
        <div className="feature">Customer verification</div>
        <div className="feature">Trading and wallet monitoring</div>
        <div className="feature">Compliance and audit reports</div>
        <div className="muted">Admin login and permissions are not implemented in this preview.</div>
      </div>
    </section>
  );
}
