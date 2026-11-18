import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import ViewHeading from '../components/ViewHeading';

const ROWS = [
  ['Account security', 'Use a unique password and keep your account details private.', '✓'],
  ['Community standards', 'Report harmful posts and block abusive accounts.', '✓'],
  ['Privacy controls', 'Private profiles and per-post audience controls are planned.', '◷'],
  ['End-to-end encryption', 'Messages are not end-to-end encrypted; they are stored on Clarke servers.', '◷'],
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { showView } = useNavigation();
  return (
    <>
      <ViewHeading title="Settings & safety" subtitle="Manage your account and community experience." />
      <div className="card-panel" style={{ padding: 18 }}>
        {ROWS.map(([title, text, mark]) => (
          <div className="settings-row" key={title}>
            <span>
              <b>{title}</b>
              <small>{text}</small>
            </span>
            <span>{mark}</span>
          </div>
        ))}
        <div className="settings-row">
          <span>
            <b>Your account</b>
            <small>
              Signed in as @{user.username}. Edit your profile, photo, email verification or delete your account.
            </small>
          </span>
          <button className="text-btn" onClick={() => showView('profile')}>
            Manage →
          </button>
        </div>
      </div>
    </>
  );
}
