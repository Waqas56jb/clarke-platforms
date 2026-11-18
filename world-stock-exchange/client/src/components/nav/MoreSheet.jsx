// Phone sheet with every section that is not on the tab bar, the theme switch and sign in / sign out.
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { MOBILE_MORE } from '../../utils/navigation';
import { money } from '../../utils/format';
import Avatar from '../Avatar';
import Dialog from '../ui/Dialog';
import NavMenuList from './NavMenuList';
import SignOutButton from './SignOutButton';
import ThemeSwitch from './ThemeSwitch';

export default function MoreSheet({ onClose }) {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const auth = (mode) => {
    onClose();
    openAuth(mode);
  };
  return (
    <Dialog title={user ? 'Your account' : 'More'} hideTitle onClose={onClose}>
      {user ? (
        <div className="row" style={{ gap: 12, marginBottom: 12 }}>
          <Avatar name={user.displayName} size="lg" />
          <div className="grow">
            <div className="list-row-title" style={{ fontSize: 16 }}>
              {user.displayName}
            </div>
            <div className="list-row-sub">Practice balance {money(user.balance)}</div>
          </div>
        </div>
      ) : (
        <div className="sheet-auth">
          <button type="button" className="btn btn-secondary" onClick={() => auth('login')}>
            Sign in
          </button>
          <button type="button" className="btn btn-accent" onClick={() => auth('register')}>
            Open account
          </button>
        </div>
      )}
      <NavMenuList items={MOBILE_MORE} onPicked={onClose} />
      <div className="nav-list-heading">Appearance</div>
      <div style={{ padding: '4px 12px 12px' }}>
        <ThemeSwitch />
      </div>
      {user && <SignOutButton className="nav-list-item" onDone={onClose} />}
    </Dialog>
  );
}
