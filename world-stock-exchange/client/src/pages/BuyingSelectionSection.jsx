import BuyingCard from '../components/BuyingCard';
import EmptyState from '../components/EmptyState';
import OrderLog from '../components/OrderLog';
import { useExchange } from '../context/ExchangeContext';
import { remainingOf } from '../utils/format';

function AvailableShares({ onSelect }) {
  const { applications } = useExchange();
  const approved = applications.filter((a) => a.status === 'Approved');
  if (!applications.length)
    return <EmptyState>No approved company shares are available yet. Approved listings will appear here.</EmptyState>;
  if (!approved.length) return <EmptyState>No approved shares currently available to buy.</EmptyState>;
  return approved.filter((a) => remainingOf(a) > 0).map((a) => <BuyingCard key={a.id} app={a} onSelect={onSelect} />);
}

export default function BuyingSelectionSection({ ticket: t }) {
  const { orders } = useExchange();
  return (
    <section id="buying" style={{ marginTop: 34 }}>
      <div className="section-head">
        <div>
          <div className="eyebrow">INVESTOR MARKETPLACE</div>
          <h2>Buying Selection — available company shares</h2>
        </div>
        <span className="pill">Approved listings only</span>
      </div>
      <p className="muted">
        Company shares appear here after an administrator marks the issuer application approved. Select a listing to
        prepare a demonstration buy order.
      </p>
      <div className="buying-grid" id="buyingSelection">
        <AvailableShares onSelect={t.select} />
      </div>
      <div className="issuer-grid">
        <div className="panel">
          <div className="eyebrow">BUYING TICKET</div>
          <h3 id="buyingTicketTitle">{t.ticket?.title || 'Select a company share'}</h3>
          <div className="trade-row">
            <span className="muted">Offer price</span>
            <b id="buyingTicketPrice">{t.ticket?.price || '—'}</b>
          </div>
          <label htmlFor="buyingQuantity">Number of shares</label>
          <input
            id="buyingQuantity"
            type="number"
            min="1"
            step="1"
            max={t.ticket?.max}
            value={t.quantity}
            onChange={(e) => t.setQuantity(e.target.value)}
          />
          <div className="trade-row">
            <span className="muted">Estimated order value</span>
            <b id="buyingEstimate">{t.estimate}</b>
          </div>
          <button
            className="buy"
            id="placeCompanyOrder"
            type="button"
            onClick={t.place}
            disabled={!t.ticket || t.ticket.disabled || t.placing}
          >
            Place demo buy order
          </button>
          <p id="buyingMessage" className="muted" style={{ fontSize: 12 }}>
            {t.message}
          </p>
        </div>
        <div className="panel">
          <div className="eyebrow">YOUR DEMO ORDER ACTIVITY</div>
          <h3>Recent company-share orders</h3>
          <div id="companyOrderHistory">
            {orders.length ? (
              orders.slice(0, 8).map((o) => <OrderLog key={o.id} order={o} />)
            ) : (
              <EmptyState>No demo orders placed yet.</EmptyState>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
