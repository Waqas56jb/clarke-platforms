// Header account control. Signed out: Sign in and Open account. Signed in: the avatar opens a dropdown
// on tablet/desktop and the More sheet on phones.
import { useEffect, useRef, useState } from 'react';
import { Settings, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { MOBILE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import Avatar from '../Avatar';
import MoreSheet from './MoreSheet';
import SignOutButton from './SignOutButton';
import ThemeSwitch from './ThemeSwitch';

function SignedOut() {
  const { openAuth } = useNavigation();
  return (
    <>
      <button type="button" className="btn btn-secondary" id="openAuth" onClick={() => openAuth('login')}>
        Sign in
      </button>
      <button type="button" className="btn btn-accent" id="openAccount" onClick={() => openAuth('register')}>
        Open account
      </button>
    </>
  );
}

function Dropdown({ onClose }) {
  const { user } = useAuth();
  const { showView } = useNavigation();
  const go = (view) => {
    onClose();
    showView(view);
  };
  return (
    <div className="menu" role="menu" aria-label="Account menu" style={{ minWidth: 260 }}>
      <div className="row" style={{ padding: '8px 12px 12px', gap: 12 }}>
        <Avatar name={user.displayName} />
        <div className="grow">
          <div className="list-row-title">{user.displayName}</div>
          <div className="list-row-sub">@{user.username}</div>
        </div>
      </div>
      <button type="button" role="menuitem" className="menu-item" onClick={() => go('account')}>
        <UserCog size={20} aria-hidden="true" /> Account
      </button>
      <button type="button" role="menuitem" className="menu-item" onClick={() => go('settings')}>
        <Settings size={20} aria-hidden="true" /> Settings
      </button>
      <div className="menu-separator" />
      <div style={{ padding: '6px 8px' }}>
        <ThemeSwitch />
      </div>
      <div className="menu-separator" />
      <SignOutButton className="menu-item" id="logoutBtn" onDone={onClose} />
    </div>
  );
}

export default function AccountMenu() {
  const { user, ready } = useAuth();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open || isMobile) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, isMobile]);

  // Until the session check finishes, show a neutral placeholder rather than flashing "Sign in".
  if (!ready) return <span className="avatar avatar-sm skeleton" aria-hidden="true" />;
  if (!user) return <SignedOut />;

  return (
    <div className="menu-anchor" ref={wrapRef}>
      <button
        type="button"
        className="avatar-button"
        id="topAvatar"
        aria-label="Open account menu"
        aria-haspopup={isMobile ? 'dialog' : 'menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar name={user.displayName} size="sm" />
      </button>
      {open && !isMobile && <Dropdown onClose={() => setOpen(false)} />}
      {open && isMobile && <MoreSheet onClose={() => setOpen(false)} />}
    </div>
  );
}
