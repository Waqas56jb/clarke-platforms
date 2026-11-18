// Practice balance and portfolio value from GET /api/portfolio when signed in; a sign-up prompt otherwise.
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAsync } from '../../hooks/useAsync';
import { fetchPortfolio } from '../../services/tradingService';
import { money } from '../../utils/format';
import { isMarketData } from '../../utils/markets';
import { Loading } from '../StateView';

function SignUpPrompt() {
  const { openAuth } = useNavigation();
  return (
    <div className="stat stat-prompt">
      <small>Practice account</small>
      <p>Open a free practice account to get a virtual balance, a portfolio and a watchlist. No real money is used.</p>
      <div className="row-wrap">
        <button type="button" className="btn btn-accent btn-sm" onClick={() => openAuth('register')}>
          Open account
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => openAuth('login')}>
          Sign in
        </button>
      </div>
    </div>
  );
}

function AccountStats() {
  const { user } = useAuth();
  const { showView } = useNavigation();
  const portfolio = useAsync(fetchPortfolio, [user.id, user.balance]);
  const value = (key) => (portfolio.data ? money(portfolio.data[key]) : portfolio.error ? '—' : '…');
  return (
    <>
      <button type="button" className="stat stat-link" onClick={() => showView('portfolio')}>
        <small>Demo account balance</small>
        <strong id="balance">{value('cash')}</strong>
      </button>
      <button type="button" className="stat stat-link" onClick={() => showView('portfolio')}>
        <small>Demo portfolio value</small>
        <strong id="portfolioValue">{value('totalValue')}</strong>
      </button>
    </>
  );
}

export default function StatsBar({ instruments }) {
  const { user, ready } = useAuth();
  const allIllustrative = !instruments?.some(isMarketData);
  return (
    <section className="stats" aria-label="Account and market summary">
      {!ready ? (
        <Loading variant="stat" count={2} text="Loading your balance" />
      ) : user ? (
        <AccountStats />
      ) : (
        <SignUpPrompt />
      )}
      <div className="stat">
        <small>{allIllustrative ? 'Illustrative markets' : 'Markets'}</small>
        <strong>{instruments ? instruments.length : '…'}</strong>
      </div>
      <div className="stat">
        <small>Live trading</small>
        <strong className="gold-text">Coming later</strong>
      </div>
    </section>
  );
}
