import Hero from './components/Hero';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
import { useWalletDemo } from './hooks/useWalletDemo';
import AboutSection from './pages/AboutSection';
import MessagingSection from './pages/MessagingSection';
import OverviewSection from './pages/OverviewSection';
import TradeSection from './pages/TradeSection';
import TransferHistorySection from './pages/TransferHistorySection';
import TransferSection from './pages/TransferSection';

export default function App() {
  const wallet = useWalletDemo();
  return (
    <>
      <SiteHeader />
      <main className="wrap" id="home">
        <Hero />
        <TradeSection balance={wallet.balance} />
        <TransferSection wallet={wallet} />
        <TransferHistorySection transfers={wallet.transfers} />
        <MessagingSection />
        <OverviewSection />
        <AboutSection />
      </main>
      <SiteFooter />
    </>
  );
}
