// Practice trade ticket: instrument, whole units, estimate, Demo buy / Demo sell → POST /api/trades.
import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { placeTrade } from '../../services/tradingService';
import { count, money } from '../../utils/format';
import { DataLabel, instrumentPrice } from '../markets/InstrumentBits';

const MAX_UNITS = 1_000_000;
const DISCLAIMER = 'Demo trades change only the sample balance on this page. No money or assets are exchanged.';

function parseUnits(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= MAX_UNITS ? n : null;
}

export default function TradeTicket({ instruments, instrumentId, onInstrument, portfolio, onTraded }) {
  const { user, refresh } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const [units, setUnits] = useState('1');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const instrument = instruments.find((i) => i.id === instrumentId) || instruments[0];
  const parsed = parseUnits(units);
  const held = portfolio?.holdings.find((h) => h.instrument.id === instrument.id)?.units || 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    const side = e.nativeEvent.submitter?.value === 'sell' ? 'sell' : 'buy';
    if (!user) {
      openAuth('login');
      return;
    }
    if (!parsed) {
      setResult({ ok: false, text: `Enter a whole number of units between 1 and ${count(MAX_UNITS)}.` });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const { trade } = await placeTrade(instrument.id, side, parsed);
      const text = `Demo ${side} recorded: ${count(trade.units)} unit(s) of ${trade.name} at ${money(trade.price)} (total ${money(trade.total)}). No real transaction occurred.`;
      setResult({ ok: true, text });
      toast(`Practice ${side} of ${count(trade.units)} ${trade.symbol} recorded.`, 'success');
      await Promise.all([refresh(), onTraded()]);
    } catch (err) {
      setResult({ ok: false, text: err.message });
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel" aria-labelledby="ticketTitle">
      <div className="eyebrow">PRACTICE ONLY</div>
      <h2 id="ticketTitle">Demo trade ticket</h2>
      <form id="tradeForm" className="stack" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="tradeInstrument">
            Select instrument
          </label>
          <select id="tradeInstrument" value={instrument.id} onChange={(e) => onInstrument(Number(e.target.value))}>
            {instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div className="trade-row">
          <span className="muted">Price</span>
          <b>{instrumentPrice(instrument)}</b>
        </div>
        <DataLabel instrument={instrument} />
        <div className="field">
          <label className="field-label" htmlFor="tradeUnits">
            Units (whole numbers)
          </label>
          <input
            id="tradeUnits"
            type="number"
            inputMode="numeric"
            min="1"
            max={MAX_UNITS}
            step="1"
            value={units}
            aria-invalid={units !== '' && !parsed}
            onChange={(e) => setUnits(e.target.value)}
          />
        </div>
        <div className="trade-row">
          <span className="muted">Estimated order value</span>
          <b id="estimate">{parsed ? money(instrument.price * parsed) : '—'}</b>
        </div>
        {user && portfolio && (
          <>
            <div className="trade-row">
              <span className="muted">Available practice cash</span>
              <b>{money(portfolio.cash)}</b>
            </div>
            <div className="trade-row">
              <span className="muted">Units you hold</span>
              <b>{count(held)}</b>
            </div>
          </>
        )}
        <div className="actions">
          <button className="btn btn-buy" id="tradeBuy" name="side" value="buy" disabled={busy}>
            Demo buy
          </button>
          <button className="btn btn-sell" id="tradeSell" name="side" value="sell" disabled={busy}>
            Demo sell
          </button>
        </div>
        <div id="tradeMessage" role="status" aria-live="polite">
          {result && (
            <p className={`notice ${result.ok ? 'notice-success' : 'notice-error'}`}>
              {result.ok ? <CheckCircle2 size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
              <span>{result.text}</span>
            </p>
          )}
        </div>
        <p className="fine-print">{DISCLAIMER}</p>
        {!user && <p className="fine-print">Sign in or open a practice account to place practice trades.</p>}
      </form>
    </section>
  );
}
