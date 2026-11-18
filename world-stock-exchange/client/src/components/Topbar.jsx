// Header. Phones: brand and account control. Tablet/desktop: screen title, practice balance and the
// account control.
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { money } from '../utils/format';
import { VIEW_TITLES } from '../utils/views';
import Brand from './Brand';
import AccountMenu from './nav/AccountMenu';

export default function Topbar() {
  const { user } = useAuth();
  const { view } = useNavigation();
  return (
    <header className="topbar">
      <Brand />
      <p className="topbar-title">{VIEW_TITLES[view]}</p>
      <div className="topbar-actions">
        {user && (
          <span className="topbar-balance">
            Practice balance <strong>{money(user.balance)}</strong>
          </span>
        )}
        <AccountMenu />
      </div>
    </header>
  );
}
