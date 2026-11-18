import { ChevronRight, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import ThemeSwitch from '../components/nav/ThemeSwitch';
import PageHeader from '../components/site/PageHeader';

export default function SettingsPage() {
  const { user } = useAuth();
  const { showView } = useNavigation();
  return (
    <div className="stack settings-page">
      <PageHeader eyebrow="PREFERENCES" title="Settings" />
      <section className="card card-pad-lg stack-sm" aria-labelledby="appearanceTitle">
        <h2 className="card-title" id="appearanceTitle">
          Appearance
        </h2>
        <p className="settings-label">Theme</p>
        <ThemeSwitch />
        <p className="caption">System follows your device setting. Your choice is saved on this device.</p>
      </section>
      {user && (
        <section className="card card-pad-lg" aria-labelledby="accountLinkTitle">
          <h2 className="card-title" id="accountLinkTitle">
            Account
          </h2>
          <button type="button" className="settings-link" onClick={() => showView('account')}>
            <UserCog size={20} aria-hidden="true" />
            <span className="list-row-main">
              <span className="list-row-title">Account</span>
              <span className="settings-text">Profile, roles, practice balance, sign out and account deletion</span>
            </span>
            <ChevronRight size={20} className="chevron" aria-hidden="true" />
          </button>
        </section>
      )}
    </div>
  );
}
