const BUY_ORDERS = [
  ['£299', '120'],
  ['£298', '80'],
  ['£295', '50'],
];
const SELL_ORDERS = [
  ['£301', '90'],
  ['£305', '70'],
  ['£310', '40'],
];

const Rows = ({ rows }) =>
  rows.map(([price, size]) => (
    <div className="orderrow" key={price}>
      <span>{price}</span>
      <b>{size}</b>
    </div>
  ));

export default function OrderBook() {
  return (
    <div className="panel">
      <h3>ORDER BOOK</h3>
      <div className="muted">Example orders only</div>
      <div className="ordergrid" style={{ marginTop: 12 }}>
        <div className="orders">
          <h4>Buy orders</h4>
          <Rows rows={BUY_ORDERS} />
        </div>
        <div className="orders sellorders">
          <h4>Sell orders</h4>
          <Rows rows={SELL_ORDERS} />
        </div>
      </div>
    </div>
  );
}
