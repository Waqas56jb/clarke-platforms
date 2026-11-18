// Practice trading on sample prices. Balance and holdings live only on this page, as in the original.
import { useState } from 'react';
import { ASSETS } from '../utils/marketData';

export function useDemoTrading() {
  const [balance, setBalance] = useState(10000);
  const [holdings, setHoldings] = useState({});
  const [message, setMessage] = useState(
    'Demo trades change only the sample balance on this page. No money or assets are exchanged.'
  );

  const portfolio =
    balance + Object.entries(holdings).reduce((s, [n, q]) => s + (ASSETS.find((x) => x.name === n)?.price || 0) * q, 0);

  const trade = (side, asset, quantity) => {
    const q = Math.max(0, quantity || 0);
    const v = asset.price * q;
    if (!q) return;
    if (side === 'buy') {
      if (v > balance) {
        setMessage('Not enough demo cash for this sample order.');
        return;
      }
      setBalance(balance - v);
      setHoldings({ ...holdings, [asset.name]: (holdings[asset.name] || 0) + q });
    } else {
      if ((holdings[asset.name] || 0) < q) {
        setMessage('You do not have enough demo units to sell.');
        return;
      }
      setBalance(balance + v);
      setHoldings({ ...holdings, [asset.name]: holdings[asset.name] - q });
    }
    setMessage(`Demo ${side} recorded: ${q} unit(s) of ${asset.name}. No real transaction occurred.`);
  };

  return { balance, portfolio, message, trade };
}
