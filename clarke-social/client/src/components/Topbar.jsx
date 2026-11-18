import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { initials } from '../utils/format';
import GlobalSearch from './GlobalSearch';
import ViewButton from './ViewButton';

export default function Topbar() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <span className="brand-mark">C</span> clarke<span className="brand-dot">.</span>
      </div>
      <GlobalSearch />
      <div className="top-actions">
        <button className="icon-btn" title="Notifications" id="notificationsBtn">
          ♧
        </button>
        <ViewButton className="icon-btn" title="Messages" view="messages">
          ▤
        </ViewButton>
        <button className="top-avatar" id="topAvatar">
          {initials(user?.displayName || user?.username || 'C')}
        </button>
        <button
          className={`btn btn-primary top-signin${user ? ' hidden' : ''}`}
          id="openAuth"
          onClick={() => openAuth()}
        >
          Sign in
        </button>
      </div>
    </header>
  );
}
