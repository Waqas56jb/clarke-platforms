// Illustration only: applies the server's fee settings (rate and basis) to an example amount. It never
// records anything; ledger entries are written by the server when a company-share sale completes.
import { useState } from 'react';
import { euros } from '../../utils/format';

const pct = (rate) => `${Number((rate * 100).toFixed(4))}%`;

function copyFor({ rate, basis }) {
  if (basis === 'profit')
    return {
      label: "Example seller's realised profit (€)",
      row: `${pct(rate)} exchange fee on the seller's realised profit`,
      note: `Demo calculator only. Fee is ${pct(rate)} of the seller's realised profit, not the full sale proceeds. No payment is taken or transferred.`,
    };
  return {
    label: 'Example gross stock sale value (€)',
    row: `${pct(rate)} exchange commission per stock sale`,
    note: `Demo calculator only. Fee is ${pct(rate)} of each stock sale's gross value, not seller profit. No payment is taken or transferred.`,
  };
}

export default function FeeCalculator({ settings }) {
  const [amount, setAmount] = useState('1000');
  const value = Math.max(0, Number(amount) || 0);
  const copy = copyFor(settings);
  return (
    <div className="stack-sm">
      <div className="field">
        <label className="field-label" htmlFor="sellerProfitEur">
          {copy.label}
        </label>
        <input
          id="sellerProfitEur"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="trade-row">
        <span className="muted">{copy.row}</span>
        <b id="sellerFeeEur">{euros(value * settings.rate)}</b>
      </div>
      <p id="feeMessage" className="fine-print">
        {copy.note}
      </p>
    </div>
  );
}
