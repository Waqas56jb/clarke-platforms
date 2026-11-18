// Tables for the portfolio screen. Each becomes stacked cards on phones (data-table CSS).
import { count, currencyAmount, formatDateTime, money, sharePrice, signedMoney } from '../../utils/format';
import { DataLabel, instrumentPrice } from '../markets/InstrumentBits';

const profitClass = (n) => (n > 0 ? 'change up' : n < 0 ? 'change down' : '');

export function HoldingsTable({ holdings, onTrade }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <caption className="sr-only">Holdings</caption>
        <thead>
          <tr>
            <th scope="col">Instrument</th>
            <th scope="col">Units</th>
            <th scope="col">Price</th>
            <th scope="col">Average cost</th>
            <th scope="col">Value</th>
            <th scope="col">Unrealised P/L</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr key={h.instrument.id}>
              <td className="cell-main">
                <span className="cell-title">{h.instrument.name}</span>
                <DataLabel instrument={h.instrument} />
              </td>
              <td data-label="Units" className="num">
                {count(h.units)}
              </td>
              <td data-label="Price" className="num">
                {instrumentPrice(h.instrument)}
              </td>
              <td data-label="Average cost" className="num">
                {money(h.averageCost)}
              </td>
              <td data-label="Value" className="num">
                {money(h.value)}
              </td>
              <td data-label="Unrealised P/L" className={`num ${profitClass(h.profit)}`}>
                {signedMoney(h.profit)}
              </td>
              <td className="cell-action">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => onTrade(h.instrument)}>
                  Trade
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CompanySharesTable({ shares, onOpen }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <caption className="sr-only">Company shares</caption>
        <thead>
          <tr>
            <th scope="col">Company</th>
            <th scope="col">Shares</th>
            <th scope="col">Paid</th>
            <th scope="col">Value (USD)</th>
          </tr>
        </thead>
        <tbody>
          {shares.map((s) => (
            <tr key={s.listingId}>
              <td className="cell-main">
                <button type="button" className="link-button cell-title" onClick={() => onOpen(s.listingId)}>
                  {s.name} ({s.symbol})
                </button>
                <span className="caption">{s.reference}</span>
              </td>
              <td data-label="Shares" className="num">
                {count(s.quantity)}
              </td>
              <td data-label="Paid" className="num">
                {currencyAmount(s.currency, s.paid)}
              </td>
              <td data-label="Value (USD)" className="num">
                {money(s.valueUsd)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TradesTable({ trades }) {
  return (
    <div className="table-wrap">
      <table className="data-table" id="tradeHistory">
        <caption className="sr-only">Practice trades</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Side</th>
            <th scope="col">Instrument</th>
            <th scope="col">Units</th>
            <th scope="col">Price</th>
            <th scope="col">Total</th>
            <th scope="col">Realised P/L</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id}>
              <td data-label="Date">{formatDateTime(t.createdAt)}</td>
              <td data-label="Side">
                <span className={`badge ${t.side === 'buy' ? 'badge-success' : 'badge-error'}`}>
                  {t.side === 'buy' ? 'Buy' : 'Sell'}
                </span>
              </td>
              <td data-label="Instrument">{t.name}</td>
              <td data-label="Units" className="num">
                {count(t.units)}
              </td>
              <td data-label="Price" className="num">
                {money(t.price)}
              </td>
              <td data-label="Total" className="num">
                {money(t.total)}
              </td>
              <td data-label="Realised P/L" className={`num ${profitClass(t.realised)}`}>
                {t.realised === null ? '—' : signedMoney(t.realised)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Company-share orders: the investor's own (GET /api/orders) or, with `issuer`, orders received.
export function CompanyOrdersTable({ orders, issuer = false, id }) {
  return (
    <div className="table-wrap">
      <table className="data-table" id={id}>
        <caption className="sr-only">{issuer ? 'Orders received' : 'Company-share orders'}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Order</th>
            <th scope="col">Company</th>
            {issuer && <th scope="col">Investor</th>}
            <th scope="col">Shares</th>
            <th scope="col">Price</th>
            <th scope="col">Total</th>
            {issuer && <th scope="col">Fund fee (EUR)</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.reference}>
              <td data-label="Date">{formatDateTime(o.createdAt)}</td>
              <td data-label="Order">{o.reference}</td>
              <td data-label="Company">
                {o.company} ({o.symbol})
              </td>
              {issuer && <td data-label="Investor">{o.investor || '—'}</td>}
              <td data-label="Shares" className="num">
                {count(o.quantity)}
              </td>
              <td data-label="Price" className="num">
                {sharePrice(o.currency, o.price)}
              </td>
              <td data-label="Total" className="num">
                {currencyAmount(o.currency, o.total)}
              </td>
              {issuer && (
                <td data-label="Fund fee (EUR)" className="num">
                  {o.fundFeeEur === undefined ? '—' : `€${Number(o.fundFeeEur).toFixed(2)}`}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
