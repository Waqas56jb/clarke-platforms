// Instrument overview: a table on tablet/desktop, stacked cards on phones (CSS).
import { ChangeValue, DataLabel, categoryLine, instrumentPrice } from './InstrumentBits';
import WatchButton from './WatchButton';

export default function MarketTable({ instruments, onWatchChange, onTrade, caption }) {
  return (
    <div className="table-wrap">
      <table className="data-table market-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">Watchlist</span>
            </th>
            <th scope="col">Instrument</th>
            <th scope="col">Price</th>
            <th scope="col">Day</th>
            <th scope="col">Data</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {instruments.map((i) => (
            <tr key={i.id}>
              <td className="cell-watch">
                <WatchButton instrument={i} onChange={onWatchChange} />
              </td>
              <td className="cell-main">
                <span className="cell-title">{i.name}</span>
                <span className="caption">{categoryLine(i)}</span>
              </td>
              <td data-label="Price" className="num">
                {instrumentPrice(i)}
              </td>
              <td data-label="Day">
                <ChangeValue instrument={i} />
              </td>
              <td data-label="Data">
                <DataLabel instrument={i} />
              </td>
              <td className="cell-action">
                {!i.quoteBased && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => onTrade(i)}>
                    Trade
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
