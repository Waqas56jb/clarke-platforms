// Phone bottom tab bar: four destinations and "More". Everything else lives in the More sheet.
import { useState } from 'react';
import { Building2, ChartCandlestick, House, Menu, TrendingUp } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { isActive } from '../utils/navigation';
import MoreSheet from './nav/MoreSheet';

const TABS = [
  { view: 'home', label: 'Home', icon: House },
  { view: 'markets', label: 'Markets', icon: TrendingUp },
  { view: 'trade', label: 'Trade', icon: ChartCandlestick },
  { view: 'listings', label: 'Listings', icon: Building2 },
];

export default function MobileNav() {
  const { view, showView } = useNavigation();
  const [moreOpen, setMoreOpen] = useState(false);
  const onTabs = TABS.some((tab) => isActive(tab, view));
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab, view);
        return (
          <button
            key={tab.view}
            type="button"
            className={`tab-item${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => showView(tab.view)}
          >
            <Icon aria-hidden="true" />
            <span>{tab.label}</span>
          </button>
        );
      })}
      <button
        type="button"
        className={`tab-item${onTabs ? '' : ' active'}`}
        id="moreTab"
        aria-haspopup="dialog"
        aria-expanded={moreOpen}
        onClick={() => setMoreOpen(true)}
      >
        <Menu aria-hidden="true" />
        <span>More</span>
      </button>
      {moreOpen && <MoreSheet onClose={() => setMoreOpen(false)} />}
    </nav>
  );
}
