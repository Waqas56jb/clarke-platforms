// Prototype-only calculator: 2% of each stock sale's gross value, recorded in a demo allocation ledger.
// Not a payment system.
import { useEffect, useState } from 'react';
import { getFund, recordFee } from '../services/fundService';
import { euros } from '../utils/format';

const PROGRAMMES = [
  [
    'Fee destination',
    'A dedicated World Stock Exchange business account and separately tracked fund ledger, subject to approved banking and safeguarding arrangements.',
  ],
  [
    'Gold programme',
    'Planned purchase and lawful import of verified gold into Grenada, with documented origin, assay, valuation, customs declarations and insurance.',
  ],
  [
    'Diamond programme',
    'Planned sourcing from Guyana and other South American suppliers, subject to verified provenance, lawful export/import permits and applicable conflict-free sourcing standards.',
  ],
];

export default function GoldDiamondFundSection() {
  const [saleInput, setSaleInput] = useState('1000');
  const [total, setTotal] = useState(0);
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState(
    "Demo calculator only. Fee is 2% of each stock sale's gross value, not seller profit. No payment is taken or transferred."
  );
  const saleValue = Math.max(0, Number(saleInput) || 0);

  useEffect(() => {
    getFund()
      .then((d) => setTotal(d.total))
      .catch((e) => setMessage(e.message));
  }, []);

  const onRecord = async () => {
    if (!saleValue) {
      setMessage('Enter a positive gross stock sale value to calculate the example fee.');
      return;
    }
    setRecording(true);
    try {
      const d = await recordFee(saleValue);
      setTotal(d.total);
      setMessage(
        `Demo allocation recorded: €${d.fee.toFixed(2)} (2% of gross stock sale value €${saleValue.toFixed(2)}). No real payment or transfer occurred.`
      );
    } catch (e) {
      setMessage(e.message);
    } finally {
      setRecording(false);
    }
  };

  return (
    <section className="panel" id="gold-diamond-fund" style={{ marginTop: 18 }}>
      <div className="eyebrow">SELLER PROFIT CONTRIBUTION · PROPOSED POLICY</div>
      <h2>2% seller-profit fee in euros</h2>
      <p className="muted">
        For approved company-share sales, the proposed exchange fee is 2% of the seller’s realised profit (not 2% of the
        full sale proceeds). The fee is calculated and settled in EUR and allocated to the World Stock Exchange Gold
        &amp; Diamond Import Fund.
      </p>
      <div className="grid">
        {PROGRAMMES.map(([title, text]) => (
          <div className="company-card" key={title}>
            <b>{title}</b>
            <p className="muted">{text}</p>
          </div>
        ))}
      </div>
      <div className="issuer-grid">
        <div>
          <label htmlFor="sellerProfitEur">Example gross stock sale value (€)</label>
          <input
            id="sellerProfitEur"
            type="number"
            min="0"
            step="0.01"
            value={saleInput}
            onChange={(e) => setSaleInput(e.target.value)}
          />
          <div className="trade-row">
            <span className="muted">2% exchange commission per stock sale</span>
            <b id="sellerFeeEur">{euros(saleValue * 0.02)}</b>
          </div>
          <button className="gold" type="button" onClick={onRecord} disabled={recording}>
            Record demo fee
          </button>
          <p id="feeMessage" className="muted" style={{ fontSize: 12 }}>
            {message}
          </p>
        </div>
        <div>
          <b>Gold &amp; Diamond Fund (demo ledger)</b>
          <div className="big" id="fundTotal">
            {euros(total)}
          </div>
          <p className="muted">Illustrative accumulated fee allocation in this browser only.</p>
          <p className="muted" style={{ fontSize: 12 }}>
            Live collection requires a licensed operating model, transparent seller agreement, bank account, transaction
            reconciliation, tax advice and applicable financial-services approvals. Physical gold and diamonds must not
            be purchased or imported until trade, customs, AML, sanctions and provenance checks are complete.
          </p>
        </div>
      </div>
    </section>
  );
}
