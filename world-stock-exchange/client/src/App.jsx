import Hero from './components/Hero';
import ImportantNotice from './components/ImportantNotice';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
import StatsBar from './components/StatsBar';
import { useBuyingTicket } from './hooks/useBuyingTicket';
import { useDemoTrading } from './hooks/useDemoTrading';
import BusinessModelSection from './pages/BusinessModelSection';
import BuyingSelectionSection from './pages/BuyingSelectionSection';
import CompanyListingsSection from './pages/CompanyListingsSection';
import GoldDiamondFundSection from './pages/GoldDiamondFundSection';
import IssuerDashboardSection from './pages/IssuerDashboardSection';
import IssuerPortalSection from './pages/IssuerPortalSection';
import MarketsSection from './pages/MarketsSection';
import PaymentsSecuritySection from './pages/PaymentsSecuritySection';
import TradeSection from './pages/TradeSection';

export default function App() {
  const trading = useDemoTrading();
  const ticket = useBuyingTicket();
  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <Hero />
        <ImportantNotice />
        <StatsBar balance={trading.balance} portfolio={trading.portfolio} />
        <MarketsSection />
        <TradeSection trading={trading} />
        <CompanyListingsSection onSelect={ticket.select} />
        <BuyingSelectionSection ticket={ticket} />
        <IssuerPortalSection />
        <IssuerDashboardSection />
        <PaymentsSecuritySection />
        <BusinessModelSection />
        <GoldDiamondFundSection />
      </main>
      <SiteFooter />
    </>
  );
}
