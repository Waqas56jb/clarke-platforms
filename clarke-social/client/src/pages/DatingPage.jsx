import { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ErrorState } from '../components/StateView';
import ViewHeading from '../components/ViewHeading';
import DatingDiscover from '../components/dating/DatingDiscover';
import DatingEditor from '../components/dating/DatingEditor';
import DatingMatches from '../components/dating/DatingMatches';
import { getDatingProfile } from '../services/datingService';

export default function DatingPage({ params }) {
  const { showView } = useNavigation();
  // "key" remounts a tab so pressing it again reloads, like the original re-render.
  const [tab, setTab] = useState({ name: 'loading', key: 0 });
  const [error, setError] = useState('');

  const open = (name) => setTab((t) => ({ name, key: t.key + 1 }));

  useEffect(() => {
    getDatingProfile()
      .then(({ profile }) =>
        setTab((t) => ({
          name: !profile ? 'editor' : params.tab === 'matches' ? 'matches' : 'discover',
          key: t.key + 1,
        }))
      )
      .catch((e) => setError(e.message));
  }, [params.tab]);

  let content;
  if (error) content = <ErrorState message={error} onRetry={() => window.location.reload()} />;
  else if (tab.name === 'loading') content = <div className="loading-card">Loading dating profiles…</div>;
  else if (tab.name === 'editor') content = <DatingEditor key={tab.key} onSaved={() => open('discover')} />;
  else if (tab.name === 'matches') content = <DatingMatches key={tab.key} />;
  else
    content = (
      <DatingDiscover key={tab.key} onShowEditor={() => open('editor')} onShowMatches={() => open('matches')} />
    );

  return (
    <>
      <ViewHeading
        eyebrow="MEET SOMEONE NEW"
        title="Clarke Dating ♥"
        subtitle="Meet people, like what catches your eye, and connect when the interest is mutual."
      />
      <div className="dating-tabs">
        <button className="btn btn-primary" id="datingDiscover" onClick={() => open('discover')}>
          Discover
        </button>
        <button className="btn" id="datingMatches" onClick={() => open('matches')}>
          Your matches
        </button>
        <button className="btn" id="datingEdit" onClick={() => open('editor')}>
          Edit profile
        </button>
        <button className="btn" id="datingPlans" onClick={() => showView('datingPremium')}>
          Premium
        </button>
      </div>
      <div id="datingContent">{content}</div>
    </>
  );
}
