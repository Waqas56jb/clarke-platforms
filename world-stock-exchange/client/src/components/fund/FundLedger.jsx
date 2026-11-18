import { euros, formatDateTime } from '../../utils/format';

export default function FundLedger({ ledger }) {
  return (
    <div className="table-wrap">
      <table className="data-table" id="fundLedger">
        <caption className="sr-only">Gold &amp; Diamond Fund ledger</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Order</th>
            <th scope="col">Company</th>
            <th scope="col">Sale value</th>
            <th scope="col">Fee basis</th>
            <th scope="col">Fee</th>
          </tr>
        </thead>
        <tbody>
          {ledger.map((e) => (
            <tr key={e.id}>
              <td data-label="Date">{formatDateTime(e.createdAt)}</td>
              <td data-label="Order">{e.orderReference || '—'}</td>
              <td data-label="Company">{e.company ? `${e.company} (${e.symbol})` : '—'}</td>
              <td data-label="Sale value" className="num">
                {euros(e.saleValueEur)}
              </td>
              <td data-label="Fee basis" className="num">
                {euros(e.basisEur)} ({e.basis === 'profit' ? 'profit' : 'gross'} × {Number((e.rate * 100).toFixed(4))}%)
              </td>
              <td data-label="Fee" className="num">
                <b>{euros(e.feeEur)}</b>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
