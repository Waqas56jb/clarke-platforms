import { coins } from '../utils/format';

export default function WalletPanel({ balance }) {
  return (
    <div className="panel" id="wallet" style={{ marginTop: 14 }}>
      <h3>◈ MY CLARKE COIN WALLET</h3>
      <div className="muted">Demo wallet profile • local preview only</div>
      <div className="wallet-id" id="myWalletId">
        CCW-100001
      </div>
      <div className="muted">Account holder: Demo Customer</div>
      <div className="stat" id="walletBalance">
        {coins(balance)}
      </div>
      <div className="feature">
        <span className="icon">✓</span>
        <div>
          Verification status
          <br />
          <b>Demo verified</b>
        </div>
      </div>
      <div className="feature">
        <span className="icon">◈</span>
        <div>
          Reserved / pending
          <br />
          <b id="reservedBalance">0.00 CC</b>
        </div>
      </div>
      <div className="muted">Sample balance only. Not real or spendable coins.</div>
    </div>
  );
}
