import { useCallback, useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { ErrorState, Loading } from '../components/StateView';
import DatingDiscover from '../components/dating/DatingDiscover';
import DatingEditor from '../components/dating/DatingEditor';
import DatingMatches from '../components/dating/DatingMatches';
import { getDatingProfile } from '../services/datingService';

const TABS = [
  { name: 'discover', id: 'datingDiscover', label: 'Discover' },
  { name: 'matches', id: 'datingMatches', label: 'Matches' },
  { name: 'profile', id: 'datingEdit', label: 'Profile' },
];

const initialTab = (requested) => (TABS.some((t) => t.name === requested) ? requested : 'discover');

export default function DatingPage({ params }) {
  const { showView, syncUrl } = useNavigation();
  // "key" remounts a tab so pressing it again reloads it.
  const [tab, setTab] = useState({ name: 'loading', key: 0 });
  const [hasProfile, setHasProfile] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  // Without a dating profile, every tab leads to the profile form first.
  const open = useCallback(
    (name) => {
      const next = hasProfile ? name : 'profile';
      setTab((t) => ({ name: next, key: t.key + 1 }));
      syncUrl('dating', next === 'discover' ? {} : { tab: next });
    },
    [hasProfile, syncUrl]
  );
  const showEditor = useCallback(() => {
    setHasProfile(false);
    setTab((t) => ({ name: 'profile', key: t.key + 1 }));
  }, []);

  useEffect(() => {
    getDatingProfile()
      .then(({ profile }) => {
        setError('');
        setHasProfile(Boolean(profile));
        setTab((t) => ({ name: profile ? initialTab(params.tab) : 'profile', key: t.key + 1 }));
      })
      .catch((e) => setError(e.message));
  }, [params.tab, attempt]);

  const onSaved = () => {
    setHasProfile(true);
    setTab((t) => ({ name: 'discover', key: t.key + 1 }));
    syncUrl('dating');
  };

  let content;
  if (error)
    content = (
      <ErrorState title="Couldn't load Clarke Dating" message={error} onRetry={() => setAttempt((n) => n + 1)} />
    );
  else if (tab.name === 'loading') content = <Loading variant="dating" text="Loading Clarke Dating" />;
  else if (tab.name === 'profile') content = <DatingEditor key={tab.key} isNew={!hasProfile} onSaved={onSaved} />;
  else if (tab.name === 'matches') content = <DatingMatches key={tab.key} />;
  else content = <DatingDiscover key={tab.key} onShowEditor={showEditor} />;

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Clarke Dating</h1>
          <p>Like what catches your eye and connect when the interest is mutual.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          id="datingPlans"
          onClick={() => showView('datingPremium')}
        >
          <Crown size={16} aria-hidden="true" />
          Premium
        </button>
      </header>
      <div className="tabs" role="tablist" aria-label="Clarke Dating sections">
        {TABS.map((t) => (
          <button
            key={t.name}
            type="button"
            role="tab"
            className="tab"
            id={t.id}
            aria-selected={tab.name === t.name}
            aria-controls="datingContent"
            onClick={() => open(t.name)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div id="datingContent" role="tabpanel" aria-labelledby={TABS.find((t) => t.name === tab.name)?.id}>
        {content}
      </div>
    </>
  );
}
