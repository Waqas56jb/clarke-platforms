import { useState } from 'react';
import { useDemoMessage } from '../context/DemoMessageContext';
import { PRICE_GBP, gbp } from '../utils/format';

// Illustrative buy/sell ticket; the button only shows the "website preview" notice.
export default function TradeBox({ side, title, totalLabel, buttonLabel, buttonClass, inputId, totalId }) {
  const showDemoMessage = useDemoMessage();
  const [amount, setAmount] = useState('1');
  const total = Math.max(0, Number(amount) || 0) * PRICE_GBP;
  return (
    <div className={`panel tradebox ${side}`}>
      <h3>{title}</h3>
      <label>Amount (CC)</label>
      <input type="number" min="0" step="1" id={inputId} value={amount} onChange={(e) => setAmount(e.target.value)} />
      <label>Illustrative price per coin</label>
      <input value="£300.00" readOnly />
      <label>{totalLabel}</label>
      <div className="stat" id={totalId}>
        {gbp(total)}
      </div>
      <button className={`btn ${buttonClass} full`} onClick={showDemoMessage}>
        {buttonLabel}
      </button>
    </div>
  );
}
