import { useState } from 'react';
import { SearchX } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useMarkets } from '../hooks/useMarkets';
import MarketTable from '../components/markets/MarketTable';
import MarketTabs from '../components/markets/MarketTabs';
import PageHeader from '../components/site/PageHeader';
import { AsyncView, EmptyState } from '../components/StateView';
import { MARKET_TABS, filterInstruments } from '../utils/markets';

const TAB_KEYS = MARKET_TABS.map(([key]) => key);

export default function MarketsPage() {
  const { params, syncUrl, navigate } = useNavigation();
  const markets = useMarkets();
  const [category, setCategory] = useState(TAB_KEYS.includes(params.tab) ? params.tab : 'All');

  const choose = (key) => {
    setCategory(key);
    syncUrl('markets', key === 'All' ? {} : { tab: key });
  };

  return (
    <div className="stack">
      <PageHeader eyebrow="MARKETPLACE" title="Explore asset classes">
        Prices are illustrative unless an instrument is marked as market data. Star an instrument to add it to your
        watchlist.
      </PageHeader>
      <MarketTabs value={category} onChange={choose} />
      <AsyncView state={markets} skeleton="row" count={8} loadingText="Loading markets">
        {(d) => {
          const shown = filterInstruments(d.instruments, category);
          if (!shown.length) return <EmptyState icon={SearchX} title="No instruments in this category yet." />;
          return (
            <div className="card table-card" id="marketGrid">
              <MarketTable
                instruments={shown}
                caption={`${category} instruments`}
                onWatchChange={markets.setWatched}
                onTrade={(i) => navigate('trade', { id: i.id })}
              />
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
