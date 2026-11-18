import { formatDateTime } from '../utils/format';

export default function OrderLog({ order: o }) {
  return (
    <div className="order-log">
      <b>
        {o.symbol} · {Number(o.quantity).toLocaleString()} shares
      </b>
      <br />
      {o.company}
      <br />
      <span className="muted">
        {o.currency} {Number(o.total).toFixed(2)} · {formatDateTime(o.createdAt)} · Demo only
      </span>
    </div>
  );
}
