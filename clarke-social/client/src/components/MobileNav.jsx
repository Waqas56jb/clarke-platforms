// Mobile bottom tab bar: exactly five destinations. Everything else lives in the header avatar sheet.
import { Heart, House, MessageCircle, Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

const TABS = [
  { view: 'home', label: 'Home', icon: House },
  { view: 'discover', label: 'Discover', icon: Search },
  { view: 'create', label: 'Create', icon: Plus },
  { view: 'dating', label: 'Dating', icon: Heart },
  { view: 'messages', label: 'Messages', icon: MessageCircle },
];

export default function MobileNav() {
  const { unreadMessages } = useAuth();
  const { view, showView, openCreate } = useNavigation();
  return (
    <nav className="bottom-nav mobile-nav" aria-label="Main navigation">
      {TABS.map(({ view: target, label, icon: Icon }) => {
        if (target === 'create')
          return (
            <button key={target} type="button" className="tab-item" onClick={openCreate} aria-label="Create post">
              <span className="tab-create">
                <Icon size={24} aria-hidden="true" />
              </span>
            </button>
          );
        const active = view === target || (target === 'dating' && view === 'datingPremium');
        return (
          <button
            key={target}
            type="button"
            className={`tab-item${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => showView(target)}
          >
            <Icon aria-hidden="true" fill={active ? 'currentColor' : 'none'} fillOpacity={0.16} />
            <span>{label}</span>
            {target === 'messages' && unreadMessages > 0 && (
              <span className="count-badge" aria-label={`${unreadMessages} unread`}>
                {unreadMessages}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
