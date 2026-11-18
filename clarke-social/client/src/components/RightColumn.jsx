import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { suggestions, toggleFollow, trending } from '../services/usersService';
import Avatar from './Avatar';
import ViewButton from './ViewButton';

const COLORS = ['avatar-purple', 'avatar-orange', 'avatar-green'];

function TrendPanel() {
  const { navigate } = useNavigation();
  const state = useAsync(() => trending().then((d) => d.tags), []);
  return (
    <section className="card-panel trend-panel">
      <div className="section-heading">
        <div>
          <h3>Trending now</h3>
          <p>Conversations picking up</p>
        </div>
        <span className="trend-flame">↗</span>
      </div>
      {state.loading && <p className="dating-muted">Loading…</p>}
      {state.error && <p className="dating-muted">{state.error}</p>}
      {state.data?.length === 0 && <p className="dating-muted">No hashtags this week yet. Use #tags in your posts.</p>}
      {state.data?.map((t, i) => (
        <a
          className="trend"
          href="#discover"
          key={t.tag}
          onClick={(e) => {
            e.preventDefault();
            navigate('discover', { q: t.tag });
          }}
        >
          <span className="trend-number">{String(i + 1).padStart(2, '0')}</span>
          <span>
            <b>{t.tag}</b>
            <small>
              {t.posts} post{t.posts === 1 ? '' : 's'}
            </small>
          </span>
          <span className="trend-arrow">↗</span>
        </a>
      ))}
      <ViewButton className="text-btn" view="discover">
        Explore topics →
      </ViewButton>
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
    try {
      const { following } = await toggleFollow(id);
      state.setData((list) => list.map((u) => (u.id === id ? { ...u, isFollowing: following } : u)));
    } catch (e) {
      toast(e.message);
    }
  };

  return (
    <section className="card-panel people-panel">
      <div className="section-heading">
        <div>
          <h3>People to know</h3>
          <p>Find your next connection</p>
        </div>
        <span className="people-icon">✧</span>
      </div>
      {state.loading && <p className="dating-muted">Loading…</p>}
      {state.error && <p className="dating-muted">{state.error}</p>}
      {state.data?.length === 0 && <p className="dating-muted">You are following everyone so far.</p>}
      {state.data?.map((p, i) => (
        <div className="person-row" key={p.id}>
          <Avatar src={p.avatar} name={p.displayName} color={COLORS[i % 3]} />
          <div className="person-info" style={{ cursor: 'pointer' }} onClick={() => navigate('member', { id: p.id })}>
            <b>{p.displayName}</b>
            <small>@{p.username}</small>
          </div>
          <button className={`follow-btn${p.isFollowing ? ' following' : ''}`} onClick={() => follow(p.id)}>
            {p.isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      ))}
      <ViewButton className="text-btn" view="discover">
        Find more people →
      </ViewButton>
    </section>
  );
}

export default function RightColumn({ visible }) {
  return (
    <aside className="right-column" style={visible ? undefined : { display: 'none' }}>
      <TrendPanel />
      <PeoplePanel />
      <section className="callout-card">
        <div className="callout-icon">◉</div>
        <span className="eyebrow">CLOSER, WHEREVER YOU ARE</span>
        <h3>
          Hear their voice.
          <br />
          See their smile.
        </h3>
        <p>Make it a voice or video call with the people you care about.</p>
        <ViewButton className="btn btn-white" view="calls">
          Explore calling
        </ViewButton>
      </section>
      <div className="legal-links">
        <a href="#terms">Terms</a>
        <a href="#privacy">Privacy</a>
        <a href="#safety">Safety</a>
        <a href="#about">About</a>
        <span>Clarke Social · 2026</span>
      </div>
    </aside>
  );
}
