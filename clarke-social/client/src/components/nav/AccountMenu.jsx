// Header avatar: a dropdown on tablet/desktop, a bottom sheet with every secondary section on phones.
import { useEffect, useRef, useState } from 'react';
import { LogOut, Settings, User, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { MOBILE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import { MOBILE_MORE } from '../../utils/navigation';
import Avatar from '../Avatar';
import Dialog from '../ui/Dialog';
import NavMenuList from './NavMenuList';
import ThemeSwitch from './ThemeSwitch';

function SignOutButton({ onDone, className }) {
  const { logout } = useAuth();
  const { navigate } = useNavigation();
  const toast = useToast();
  return (
    <button
      type="button"
      className={className}
      id="logoutBtn"
      onClick={async () => {
        onDone();
        await logout();
        navigate('home');
        toast('You have signed out.', 'success');
      }}
    >
      <LogOut size={20} aria-hidden="true" />
      <span>Sign out</span>
    </button>
  );
}

export default function AccountMenu() {
  const { user } = useAuth();
  const { openAuth, showView } = useNavigation();
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

  if (!user)
    return (
      <button type="button" className="btn btn-primary btn-sm" id="openAuth" onClick={() => openAuth()}>
        Sign in
      </button>
    );

  const go = (view, params) => {
    setOpen(false);
    showView(view, params);
  };

  return (
    <div className="menu-anchor" ref={wrapRef}>
      <button
        type="button"
        className="avatar-button"
        id="topAvatar"
        aria-label="Open profile menu"
        aria-haspopup={isMobile ? 'dialog' : 'menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar src={user.avatar} name={user.displayName} size="sm" />
      </button>
      {open && !isMobile && (
        <div className="menu" role="menu" aria-label="Profile menu" style={{ minWidth: 260 }}>
          <div className="row" style={{ padding: '8px 12px 12px', gap: 12 }}>
            <Avatar src={user.avatar} name={user.displayName} />
            <div className="grow">
              <div className="list-row-title">{user.displayName}</div>
              <div className="list-row-sub">@{user.username}</div>
            </div>
          </div>
          <button type="button" role="menuitem" className="menu-item" onClick={() => go('member', { id: user.id })}>
            <User size={20} aria-hidden="true" /> View profile
          </button>
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
          <SignOutButton className="menu-item" onDone={() => setOpen(false)} />
        </div>
      )}
      {open && isMobile && (
        <Dialog title="Your account" hideTitle onClose={() => setOpen(false)}>
          <div className="row" style={{ gap: 12, marginBottom: 12 }}>
            <Avatar src={user.avatar} name={user.displayName} size="lg" />
            <div className="grow">
              <div className="list-row-title" style={{ fontSize: 16 }}>
                {user.displayName}
              </div>
              <div className="list-row-sub">@{user.username}</div>
            </div>
          </div>
          <NavMenuList items={MOBILE_MORE} onPicked={() => setOpen(false)} />
          <div className="nav-list-heading">Appearance</div>
          <div style={{ padding: '4px 12px 12px' }}>
            <ThemeSwitch />
          </div>
          <SignOutButton className="nav-list-item" onDone={() => setOpen(false)} />
        </Dialog>
      )}
    </div>
  );
}
