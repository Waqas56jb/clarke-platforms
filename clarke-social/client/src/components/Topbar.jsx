import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { mediaUrl } from '../services/http';
import { initials } from '../utils/format';
import GlobalSearch from './GlobalSearch';
import NotificationsMenu from './NotificationsMenu';
import ViewButton from './ViewButton';

export default function Topbar() {
  const { user } = useAuth();
  const { openAuth, showView } = useNavigation();
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <span className="brand-mark">C</span> clarke<span className="brand-dot">.</span>
      </div>
      <GlobalSearch />
      <div className="top-actions">
        <NotificationsMenu />
        <ViewButton className="icon-btn" title="Messages" view="messages">
          ▤
        </ViewButton>
        <button
          className="top-avatar"
          id="topAvatar"
          title={user ? 'My profile' : 'Sign in'}
          onClick={() => (user ? showView('profile') : openAuth())}
        >
          {user?.avatar ? <img src={mediaUrl(user.avatar)} alt="" /> : initials(user?.displayName || 'C')}
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
