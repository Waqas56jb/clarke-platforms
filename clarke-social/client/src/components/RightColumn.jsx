// Desktop right panel. Its content depends on the screen: feed screens get trends and people,
// Discover leads with people, Dating shows the member's dating status.
import { Crown, Hash, Heart, ShieldCheck, TrendingUp, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { getDatingProfile } from '../services/datingService';
import { suggestions, toggleFollow, trending } from '../services/usersService';
import { PLAN_NAMES } from '../utils/format';
import Avatar from './Avatar';
import { Loading } from './StateView';

function TrendPanel() {
  const { navigate } = useNavigation();
  const state = useAsync(() => trending().then((d) => d.tags), []);
  return (
    <section className="card trend-panel" aria-labelledby="trend-title">
      <div className="card-head">
        <div>
          <h2 className="card-title" id="trend-title">
            Trending now
          </h2>
          <p>Hashtags from the last 7 days</p>
        </div>
        <TrendingUp size={20} className="text-muted" aria-hidden="true" />
      </div>
      {state.loading && !state.data && <Loading variant="list" count={3} text="Loading trends" />}
      {state.error && <p className="inline-error">{state.error}</p>}
      {state.data?.length === 0 && (
        <p className="text-sm text-muted">No hashtags this week yet. Add #tags to your posts.</p>
      )}
      {state.data?.map((t) => (
        <button
          type="button"
          className="list-row list-row-button"
          key={t.tag}
          onClick={() => navigate('discover', { q: t.tag })}
        >
          <span className="state-icon" style={{ width: 36, height: 36, margin: 0 }}>
            <Hash size={16} aria-hidden="true" />
          </span>
          <span className="list-row-main">
            <span className="list-row-title">{t.tag.replace(/^#/, '')}</span>
            <span className="list-row-sub">
              {t.posts} post{t.posts === 1 ? '' : 's'}
            </span>
          </span>
        </button>
      ))}
    </section>
  );
}

function PeoplePanel() {
  const { user } = useAuth();
  const { navigate, openAuth } = useNavigation();
  const toast = useToast();
  const state = useAsync(() => suggestions().then((d) => d.users), [user?.id]);

  const follow = async (id) => {
    if (!user) return openAuth();
    const before = state.data;
    state.setData((list) => list.map((u) => (u.id === id ? { ...u, isFollowing: !u.isFollowing } : u)));
    try {
      const { following } = await toggleFollow(id);
      state.setData((list) => list.map((u) => (u.id === id ? { ...u, isFollowing: following } : u)));
    } catch (e) {
      state.setData(before);
      toast(e.message, 'error');
    }
  };

  return (
    <section className="card people-panel" aria-labelledby="people-title">
      <div className="card-head">
        <div>
          <h2 className="card-title" id="people-title">
            People to know
          </h2>
          <p>Suggested connections</p>
        </div>
        <UserPlus size={20} className="text-muted" aria-hidden="true" />
      </div>
      {state.loading && !state.data && <Loading variant="list" count={3} text="Loading suggestions" />}
      {state.error && <p className="inline-error">{state.error}</p>}
      {state.data?.length === 0 && <p className="text-sm text-muted">You&apos;re following everyone so far.</p>}
      {state.data?.map((p) => (
        <div className="list-row person-row" key={p.id}>
          <button
            type="button"
            className="avatar-button"
            onClick={() => navigate('member', { id: p.id })}
            aria-label={`Open ${p.displayName}'s profile`}
          >
            <Avatar src={p.avatar} name={p.displayName} size="sm" />
          </button>
          <button
            type="button"
            className="list-row-main person-info"
            onClick={() => navigate('member', { id: p.id })}
            style={{ border: 0, background: 'none', padding: 0, textAlign: 'left' }}
          >
            <span className="list-row-title">{p.displayName}</span>
            <span className="list-row-sub">@{p.username}</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm follow-btn ${p.isFollowing ? 'btn-secondary following' : 'btn-primary'}`}
            aria-pressed={p.isFollowing}
            onClick={() => follow(p.id)}
          >
            {p.isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      ))}
      <button type="button" className="btn-link" style={{ marginTop: 8 }} onClick={() => navigate('discover')}>
        Find more people
      </button>
    </section>
  );
}

function DatingPanel() {
  const { user, plans } = useAuth();
  const { showView } = useNavigation();
  const profile = useAsync(
    () => (user ? getDatingProfile().then((d) => d.profile) : Promise.resolve(null)),
    [user?.id]
  );
  const datingPlan = plans.find((p) => p.planKey.startsWith('dating_'));
  const p = profile.data;
  const fields = p ? [p.birth_date, p.gender, p.location, p.dating_bio, p.interests, p.photo_url] : [];
  const complete = p ? Math.round((fields.filter(Boolean).length / fields.length) * 100) : 0;
  return (
    <>
      <section className="card" aria-labelledby="dating-status">
        <div className="card-head">
          <h2 className="card-title" id="dating-status">
            Your dating profile
          </h2>
          <Heart size={20} className="text-muted" aria-hidden="true" />
        </div>
        {profile.loading && !profile.data ? (
          <Loading variant="card" text="Loading dating profile" />
        ) : p ? (
          <div className="stack-sm">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="text-sm">Profile {complete}% complete</span>
              <span className="badge">{complete === 100 ? 'COMPLETE' : 'IN PROGRESS'}</span>
            </div>
            <div
              className="progress"
              role="progressbar"
              aria-valuenow={complete}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completion"
            >
              <span style={{ width: `${complete}%` }} />
            </div>
            {complete < 100 && <p className="caption">Add a photo and interests so people know more about you.</p>}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => showView('dating', { tab: 'profile' })}
            >
              Edit dating profile
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted">Create your dating profile to start discovering people.</p>
        )}
      </section>
      <section className="card" aria-labelledby="dating-plan">
        <div className="card-head">
          <h2 className="card-title" id="dating-plan">
            Membership
          </h2>
          <Crown size={20} className="text-muted" aria-hidden="true" />
        </div>
        <p className="text-sm">
          {datingPlan
            ? `${PLAN_NAMES[datingPlan.planKey]} until ${new Date(datingPlan.expiresAt).toLocaleDateString()}`
            : 'Free plan: a smaller discovery page each visit.'}
        </p>
        <button type="button" className="btn-link" style={{ marginTop: 8 }} onClick={() => showView('datingPremium')}>
          {datingPlan ? 'Manage membership' : 'See Dating Plus and VIP'}
        </button>
      </section>
      <section className="card">
        <div className="card-head">
          <h2 className="card-title">Date safely</h2>
          <ShieldCheck size={20} className="text-muted" aria-hidden="true" />
        </div>
        <ul className="text-sm" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
          <li>Chat on Clarke before sharing your number.</li>
          <li>Meet in a public place and tell a friend.</li>
          <li>Report or block anyone who makes you uncomfortable.</li>
        </ul>
      </section>
    </>
  );
}

export default function RightColumn({ view }) {
  let content;
  if (view === 'dating') content = <DatingPanel />;
  else if (view === 'discover')
    content = (
      <>
        <PeoplePanel />
        <TrendPanel />
      </>
    );
  else
    content = (
      <>
        <TrendPanel />
        <PeoplePanel />
      </>
    );
  return (
    <aside className="right-panel right-column" aria-label="Suggestions">
      {content}
      <div className="legal-links">Clarke Social · 2026</div>
    </aside>
  );
}
