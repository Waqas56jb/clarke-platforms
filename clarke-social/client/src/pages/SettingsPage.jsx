import ViewHeading from '../components/ViewHeading';

const ROWS = [
  ['Account security', 'Use a unique password and keep your account details private.', '✓'],
  ['Community standards', 'Report harmful posts and block abusive accounts.', '✓'],
  ['Privacy controls', 'Private profiles and per-post audience controls are planned.', '◷'],
  ['End-to-end encryption', 'Not enabled until protocol and device-key safeguards are complete.', '◷'],
];

export default function SettingsPage() {
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
      </div>
    </>
  );
}
