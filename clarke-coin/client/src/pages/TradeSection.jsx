import OrderBook from '../components/OrderBook';
import PriceChart from '../components/PriceChart';
import TradeBox from '../components/TradeBox';
import WalletPanel from '../components/WalletPanel';

export default function TradeSection({ balance }) {
  return (
    <section className="grid" id="trade">
      <div>
        <TradeBox
          side="buy"
          title="↑ BUY CLARKE COIN"
          totalLabel="Estimated total"
          buttonLabel="Buy Clarke Coin"
          buttonClass="buybtn"
          inputId="buyAmount"
          totalId="buyTotal"
        />
        <TradeBox
          side="sell"
          title="↓ SELL CLARKE COIN"
          totalLabel="Estimated proceeds"
          buttonLabel="Sell Clarke Coin"
          buttonClass="sellbtn"
          inputId="sellAmount"
          totalId="sellTotal"
        />
      </div>
      <PriceChart />
      <div>
        <OrderBook />
        <WalletPanel balance={balance} />
      </div>
    </section>
  );
}
