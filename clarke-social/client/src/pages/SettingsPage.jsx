// Settings: a grouped list on phones; a settings menu with a detail panel on tablet and desktop.
// Only settings that really exist are shown.
import { useState } from 'react';
import { ChevronRight, CreditCard, Crown, Heart, Palette, Shield, User, UserCog, UserPen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import ThemeSwitch from '../components/nav/ThemeSwitch';
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery';

function LinkRow({ icon: Icon, title, text, onClick }) {
  return (
    <button type="button" className="settings-link" onClick={onClick}>
      <Icon size={20} aria-hidden="true" />
      <span className="list-row-main">
        <span className="list-row-title">{title}</span>
        <span className="settings-text">{text}</span>
      </span>
      <ChevronRight size={20} className="chevron" aria-hidden="true" />
    </button>
  );
}

function Appearance() {
  return (
    <div className="stack-sm">
      <p className="settings-label">Theme</p>
      <ThemeSwitch />
      <p className="caption">System follows your device setting. Your choice is saved on this device.</p>
    </div>
  );
}

function AccountLinks() {
  const { user } = useAuth();
  const { showView } = useNavigation();
  return (
    <div className="settings-links">
      <LinkRow
        icon={UserCog}
        title="Account"
        text="Email, verification, membership, password, sign out and account deletion"
        onClick={() => showView('account')}
      />
      <LinkRow
        icon={UserPen}
        title="Edit profile"
        text="Profile photo, display name and bio"
        onClick={() => showView('profile')}
      />
      <LinkRow
        icon={User}
        title="View my public profile"
        text={`See your profile as others see it (@${user.username})`}
        onClick={() => showView('member', { id: user.id })}
      />
    </div>
  );
}

function PrivacySafety() {
  return (
    <ul className="settings-facts">
      <li>
        <p className="list-row-title">Reporting</p>
        <p className="settings-text">
          You can report posts, dating profiles, tracks and films from their menus. Reports are private.
        </p>
      </li>
      <li>
        <p className="list-row-title">Blocking</p>
        <p className="settings-text">
          You can block members. A block works both ways and stops messages, calls and dating between you.
        </p>
      </li>
      <li>
        <p className="list-row-title">Messages</p>
        <p className="settings-text">Messages are stored on Clarke servers and are not end-to-end encrypted.</p>
      </li>
    </ul>
  );
}

function PlansLinks() {
  const { showView } = useNavigation();
  return (
    <div className="settings-links">
      <LinkRow
        icon={Crown}
        title="Supporter & Creator Plans"
        text="Plans, checkout and your payment history"
        onClick={() => showView('premium')}
      />
      <LinkRow
        icon={Heart}
        title="Dating memberships"
        text="Dating Plus and Dating VIP"
        onClick={() => showView('datingPremium')}
      />
    </div>
  );
}

const GROUPS = [
  { key: 'appearance', label: 'Appearance', icon: Palette, Panel: Appearance },
  { key: 'account', label: 'Account', icon: UserCog, Panel: AccountLinks },
  { key: 'privacy', label: 'Privacy & safety', icon: Shield, Panel: PrivacySafety },
  { key: 'plans', label: 'Plans & payments', icon: CreditCard, Panel: PlansLinks },
];

export default function SettingsPage() {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [active, setActive] = useState('appearance');
  const current = GROUPS.find((g) => g.key === active);

  return (
    <div className="settings-page">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your appearance, account and safety on Clarke.</p>
        </div>
      </header>
      {isMobile ? (
        <div className="stack">
          {GROUPS.map(({ key, label, Panel }) => (
            <section className="settings-group" key={key} aria-labelledby={`settings-${key}`}>
              <h2 className="settings-group-title" id={`settings-${key}`}>
                {label}
              </h2>
              <div className="card card-pad">
                <Panel />
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="settings-layout">
          <nav className="card settings-nav" aria-label="Settings sections">
            <div className="nav-list">
              {GROUPS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={`nav-list-item${active === key ? ' active' : ''}`}
                  aria-current={active === key ? 'true' : undefined}
                  onClick={() => setActive(key)}
                >
                  <Icon size={20} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </nav>
          <section className="card card-pad-lg settings-panel" aria-labelledby="settingsPanelTitle">
            <h2 className="card-title" id="settingsPanelTitle">
              {current.label}
            </h2>
            <current.Panel />
          </section>
        </div>
      )}
    </div>
  );
}
