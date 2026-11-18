import { Briefcase, Building2, History, Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useAsync } from '../hooks/useAsync';
import { fetchCompanyOrders, fetchPortfolio } from '../services/tradingService';
import {
  CompanyOrdersTable,
  CompanySharesTable,
  HoldingsTable,
  TradesTable,
} from '../components/portfolio/PortfolioTables';
import PageHeader from '../components/site/PageHeader';
import RequireAuth from '../components/site/RequireAuth';
import { AsyncView, EmptyState } from '../components/StateView';
import { money, signedMoney } from '../utils/format';

const loadAll = () =>
  Promise.all([fetchPortfolio(), fetchCompanyOrders()]).then(([portfolio, { orders }]) => ({ ...portfolio, orders }));

function Section({ id, title, icon, empty, children }) {
  return (
    <section className="card table-card" aria-labelledby={id}>
      <h2 className="card-title table-card-title" id={id}>
        {title}
      </h2>
      {children || <EmptyState icon={icon} plain title={empty} />}
    </section>
  );
}

function Summary({ p }) {
  const items = [
    ['Practice cash', money(p.cash), 'portfolioCash'],
    ['Holdings value', money(p.holdingsValue), 'portfolioHoldings'],
    ['Total value', money(p.totalValue), 'portfolioTotal'],
    ['Unrealised P/L', signedMoney(p.unrealisedProfit), 'portfolioProfit'],
  ];
  return (
    <section className="stats" aria-label="Portfolio summary">
      {items.map(([label, value, id]) => (
        <div className="stat" key={id}>
          <small>{label}</small>
          <strong id={id}>{value}</strong>
        </div>
      ))}
    </section>
  );
}

function Portfolio() {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const state = useAsync(loadAll, [user.id, user.balance]);
  return (
    <AsyncView state={state} count={3} loadingText="Loading your portfolio">
      {(p) => (
        <div className="stack">
          <Summary p={p} />
          <Section
            id="holdingsTitle"
            title="Holdings"
            icon={Briefcase}
            empty="No holdings yet. Place a practice trade."
          >
            {p.holdings.length > 0 && (
              <HoldingsTable holdings={p.holdings} onTrade={(i) => navigate('trade', { id: i.id })} />
            )}
          </Section>
          <Section id="sharesTitle" title="Company shares" icon={Building2} empty="No company shares bought yet.">
            {p.companyShares.length > 0 && (
              <CompanySharesTable shares={p.companyShares} onOpen={(id) => navigate('listing', { id })} />
            )}
          </Section>
          <Section
            id="historyTitle"
            title="Order history (practice trades)"
            icon={History}
            empty="No practice trades yet."
          >
            {p.trades.length > 0 && <TradesTable trades={p.trades} />}
          </Section>
          <Section id="ordersTitle" title="Company-share orders" icon={Receipt} empty="No demo orders placed yet.">
            {p.orders.length > 0 && <CompanyOrdersTable orders={p.orders} id="companyOrderHistory" />}
          </Section>
        </div>
      )}
    </AsyncView>
  );
}

export default function PortfolioPage() {
  return (
    <div className="stack">
      <PageHeader eyebrow="PRACTICE ACCOUNT" title="Portfolio">
        Your virtual balance, holdings and order history. Values use the stored instrument prices and listing offer
        prices; no real money or assets are held.
      </PageHeader>
      <RequireAuth title="Sign in to see your portfolio" message="Your practice portfolio is saved to your account.">
        <Portfolio />
      </RequireAuth>
    </div>
  );
}
