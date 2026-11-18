import { useNavigation } from './context/NavigationContext';
import AuthModal from './components/AuthModal';
import EmailNotice from './components/EmailNotice';
import MobileNav from './components/MobileNav';
import Sidebar from './components/Sidebar';
import SiteFooter from './components/site/SiteFooter';
import Topbar from './components/Topbar';
import { useUrlActions } from './hooks/useUrlActions';
import AccountPage from './pages/AccountPage';
import FundPage from './pages/FundPage';
import HomePage from './pages/HomePage';
import InfoPage from './pages/InfoPage';
import IssuerPage from './pages/IssuerPage';
import ListingPage from './pages/ListingPage';
import ListingsPage from './pages/ListingsPage';
import MarketsPage from './pages/MarketsPage';
import PortfolioPage from './pages/PortfolioPage';
import ReviewPage from './pages/ReviewPage';
import SettingsPage from './pages/SettingsPage';
import TradePage from './pages/TradePage';

const PAGES = {
  home: HomePage,
  markets: MarketsPage,
  trade: TradePage,
  portfolio: PortfolioPage,
  listings: ListingsPage,
  listing: ListingPage,
  issuer: IssuerPage,
  review: ReviewPage,
  fund: FundPage,
  info: InfoPage,
  account: AccountPage,
  settings: SettingsPage,
};

export default function App() {
  const { view, params } = useNavigation();
  useUrlActions();
  const Page = PAGES[view] || HomePage;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="app-shell">
        <Sidebar />
        <div className="app-main">
          <Topbar />
          <EmailNotice />
          <main id="main" className="content" tabIndex={-1}>
            {/* Keyed by route so returning to a screen (or another listing) starts fresh. */}
            <div key={`${view}:${params.id ?? ''}`} className="page-enter">
              <Page />
            </div>
            <SiteFooter />
          </main>
        </div>
        <MobileNav />
      </div>
      <AuthModal />
    </>
  );
}
