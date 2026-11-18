// Header. Phones: logo, search, notifications, avatar. Tablet/desktop: search field, notifications,
// messages shortcut and the avatar menu.
import { MessageCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import GlobalSearch from './GlobalSearch';
import NotificationsMenu from './NotificationsMenu';
import AccountMenu from './nav/AccountMenu';

export default function Topbar() {
  const { user, unreadMessages } = useAuth();
  const { navigate, showView, view } = useNavigation();
  return (
    <header className="topbar">
      <button type="button" className="brand mobile-brand" onClick={() => navigate('home')} aria-label="Clarke home">
        <span className="brand-mark" aria-hidden="true">
          C
        </span>
        <span>
          clarke<span className="brand-dot">.</span>
        </span>
      </button>
      <div className="topbar-search">
        <GlobalSearch />
      </div>
      <div className="topbar-actions">
        <button
          type="button"
          className={`icon-btn topbar-search-button${view === 'discover' ? ' active' : ''}`}
          aria-label="Search"
          onClick={() => navigate('discover')}
        >
          <Search size={22} aria-hidden="true" />
        </button>
        <NotificationsMenu />
        {user && (
          <button
            type="button"
            className="icon-btn topbar-messages"
            aria-label={unreadMessages ? `Open messages, ${unreadMessages} unread` : 'Open messages'}
            onClick={() => showView('messages')}
          >
            <MessageCircle size={22} aria-hidden="true" />
            {unreadMessages > 0 && <span className="count-badge">{unreadMessages}</span>}
          </button>
        )}
        <AccountMenu />
      </div>
    </header>
  );
}
