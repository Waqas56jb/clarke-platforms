import { Receipt } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { paymentHistory } from '../../services/paymentsService';
import { money } from '../../utils/format';
import { EmptyState, ErrorState, Loading } from '../StateView';
import { formatDate } from '../PlanStatus';

const STATUS = {
  paid: ['Paid', 'badge-success'],
  pending: ['Pending', 'badge-warning'],
  failed: ['Failed', 'badge-error'],
  cancelled: ['Cancelled', 'badge-neutral'],
};

function HistoryTable({ payments }) {
  return (
    <table className="data-table payment-table">
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Item</th>
          <th scope="col">Amount</th>
          <th scope="col">Status</th>
          <th scope="col">Reference</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((p) => {
          const [label, tone] = STATUS[p.status] || [p.status, 'badge-neutral'];
          return (
            <tr key={p.reference}>
              <td data-label="Date">{formatDate(p.createdAt)}</td>
              <td data-label="Item" className="payment-item">
                {p.name}
              </td>
              <td data-label="Amount">{money(p.amount, p.currency)}</td>
              <td data-label="Status">
                <span className={`badge ${tone}`}>{label}</span>
              </td>
              <td data-label="Reference" className="payment-ref">
                {p.reference}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function PaymentHistory() {
  const state = useAsync(() => paymentHistory().then((d) => d.payments), []);
  let body;
  if (state.loading && !state.data) body = <Loading variant="list" count={3} text="Loading payment history" />;
  else if (state.error && !state.data)
    body = <ErrorState plain title="Couldn't load your payments" message={state.error} onRetry={state.reload} />;
  else if (!state.data.length) body = <EmptyState plain icon={Receipt} title="No transactions yet." />;
  else body = <HistoryTable payments={state.data} />;
  return <div id="paymentHistory">{body}</div>;
}
