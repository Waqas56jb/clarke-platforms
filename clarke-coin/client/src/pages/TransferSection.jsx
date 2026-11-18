import { useState } from 'react';
import { coins } from '../utils/format';

// Wallet-to-wallet transfer preview: lookup, amount and balance checks, confirmation and a local record.
export default function TransferSection({ wallet }) {
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState('Recipient details will appear here after lookup.');
  const [status, setStatus] = useState(null);

  const lookup = () => {
    const result = wallet.findRecipient(walletId);
    setPreview(result.preview);
    return result.recipient || null;
  };

  const onLookup = () => {
    const r = lookup();
    if (r)
      setStatus({
        message: `Recipient verified in this demo: ${r.name}. Check the Wallet ID carefully before sending.`,
      });
  };

  const onSend = () => {
    const recipient = lookup();
    if (!recipient) {
      setStatus({ message: 'Transfer stopped: recipient Wallet ID was not found.', error: true });
      return;
    }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setStatus({ message: 'Enter a valid amount greater than zero.', error: true });
      return;
    }
    if (value > wallet.balance) {
      setStatus({ message: 'Insufficient available balance. No coins were sent.', error: true });
      return;
    }
    if (
      !window.confirm(
        `Send ${value.toFixed(2)} CC to ${recipient.name} (${recipient.id})? This demo transfer cannot be undone.`
      )
    )
      return;
    const transferId = wallet.send(recipient, value, note.trim());
    setStatus({
      message: `Demo transfer complete. Reference: ${transferId}. Both demo wallet balances and history have been updated.`,
    });
    setAmount('');
    setNote('');
  };

  return (
    <section className="panel" id="transfer" style={{ marginTop: 15 }}>
      <div className="chart-head">
        <div>
          <h3>↔ WALLET-TO-WALLET COIN TRANSFER</h3>
          <div className="muted">Send Clarke Coins directly to another customer using their unique Wallet ID.</div>
        </div>
        <span className="pill">Demo preview</span>
      </div>
      <div className="wallet-grid">
        <div>
          <div className="muted">YOUR SENDING WALLET</div>
          <div className="wallet-id">CCW-100001</div>
          <div className="stat" id="transferAvailable">
            {coins(wallet.balance)}
          </div>
          <div className="muted">Available balance</div>
        </div>
        <div>
          <label htmlFor="recipientWalletId">Recipient Wallet ID</label>
          <input
            id="recipientWalletId"
            placeholder="Example: CCW-100002"
            autoComplete="off"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
          />
          <div className="field-help">Demo recipient: CCW-100002 (Alex Morgan). Enter this ID to test a transfer.</div>
          <div id="recipientPreview" className="field-help">
            {preview}
          </div>
        </div>
      </div>
      <div className="wallet-grid" style={{ marginTop: 8 }}>
        <div>
          <label htmlFor="transferAmount">Amount to send (CC)</label>
          <input
            id="transferAmount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Enter coin amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="transferNote">Payment note (optional)</label>
          <input
            id="transferNote"
            maxLength={120}
            placeholder="What is this transfer for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
      <div className="wallet-actions">
        <button className="btn full" id="lookupRecipient" type="button" onClick={onLookup}>
          Find Wallet
        </button>
        <button className="btn buybtn full" id="sendCoins" type="button" onClick={onSend}>
          Review &amp; Send Coins
        </button>
      </div>
      <div
        className={`transfer-status${status?.error ? ' error' : ''}`}
        id="transferStatus"
        role="status"
        aria-live="polite"
        style={status ? { display: 'block' } : undefined}
      >
        {status?.message}
      </div>
      <p className="field-help">
        Security preview: recipient lookup, positive amount and available-balance checks, confirmation, transfer IDs and
        a local activity record. This browser demo does not connect to the Clarke Coin blockchain or move real coins.
      </p>
    </section>
  );
}
