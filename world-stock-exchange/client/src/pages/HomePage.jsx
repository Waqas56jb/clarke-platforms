import { ArrowRight, Building2, ChartCandlestick, FileUp, Gem, ShieldCheck } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useMarkets } from '../hooks/useMarkets';
import MarketCard from '../components/markets/MarketCard';
import Hero from '../components/site/Hero';
import ImportantNotice from '../components/site/ImportantNotice';
import PageHeader from '../components/site/PageHeader';
import StatsBar from '../components/site/StatsBar';
import { AsyncView } from '../components/StateView';

const PREVIEW_COUNT = 6;

const SECTIONS = [
  ['trade', ChartCandlestick, 'Practice trading', 'Buy and sell instruments with your virtual balance.'],
  ['listings', Building2, 'Company listings', 'Approved company share offerings and the buying ticket.'],
  ['issuer', FileUp, 'List your company', 'Submit your company and documents for review.'],
  ['fund', Gem, 'Gold & Diamond Fund', 'The proposed 2% fee and its allocation ledger.'],
  ['info', ShieldCheck, 'Payments & security', 'Planned payment options, security and business model.'],
];

export default function HomePage() {
  const { navigate, showView } = useNavigation();
  const markets = useMarkets();
  const openTrade = (i) => navigate('trade', { id: i.id });

  return (
    <div className="stack-lg">
      <Hero />
      <ImportantNotice />
      <StatsBar instruments={markets.data?.instruments} />
      <section aria-labelledby="overviewTitle">
        <PageHeader
          level={2}
          id="overviewTitle"
          eyebrow="MARKETPLACE"
          title="Market overview"
          actions={
            <button type="button" className="btn btn-secondary" onClick={() => navigate('markets')}>
              All markets
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          }
        />
        <AsyncView state={markets} skeleton="card" count={3} grid="260px" loadingText="Loading markets">
          {(d) => (
            <div className="card-grid">
              {d.instruments.slice(0, PREVIEW_COUNT).map((i) => (
                <MarketCard key={i.id} instrument={i} onOpen={openTrade} />
              ))}
            </div>
          )}
        </AsyncView>
      </section>
      <section aria-labelledby="exploreTitle">
        <PageHeader level={2} id="exploreTitle" eyebrow="EXPLORE" title="Everything on World Stock Exchange" />
        <div className="card-grid">
          {SECTIONS.map(([view, Icon, title, text]) => (
            <button key={view} type="button" className="link-card" onClick={() => showView(view)}>
              <Icon size={24} aria-hidden="true" />
              <span className="link-card-title">{title}</span>
              <span className="muted">{text}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
