import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useAsync } from '../hooks/useAsync';
import { useMarkets } from '../hooks/useMarkets';
import { fetchPortfolio } from '../services/tradingService';
import PageHeader from '../components/site/PageHeader';
import { AsyncView } from '../components/StateView';
import TradeTicket from '../components/trade/TradeTicket';
import WatchlistPanel from '../components/trade/WatchlistPanel';

const noPortfolio = () => Promise.resolve(null);

export default function TradePage() {
  const { user } = useAuth();
  const { params, syncUrl } = useNavigation();
  const markets = useMarkets();
  const portfolio = useAsync(user ? fetchPortfolio : noPortfolio, [user?.id]);
  const [instrumentId, setInstrumentId] = useState(params.id);

  const choose = (id) => {
    setInstrumentId(id);
    syncUrl('trade', { id });
  };

  return (
    <div className="stack">
      <PageHeader eyebrow="PRACTICE TRADING" title="Trade">
        Place practice trades with your virtual balance. Prices are illustrative unless marked as market data.
      </PageHeader>
      <div className="layout-split">
        <AsyncView state={markets} count={2} loadingText="Loading the trade ticket">
          {(d) => (
            <TradeTicket
              instruments={d.instruments.filter((i) => !i.quoteBased)}
              instrumentId={instrumentId}
              onInstrument={choose}
              portfolio={portfolio.data}
              onTraded={portfolio.reload}
            />
          )}
        </AsyncView>
        <WatchlistPanel onSelect={choose} />
      </div>
    </div>
  );
}
