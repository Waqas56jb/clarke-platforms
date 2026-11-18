import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { ErrorState, Loading } from '../components/StateView';
import ViewHeading from '../components/ViewHeading';
import { useAsync } from '../hooks/useAsync';
import { usePostActions } from '../hooks/usePostActions';
import { searchAll, searchUsers, toggleFollow } from '../services/usersService';

// Members (all members when the box is empty) and, for a search, matching posts and hashtags.
export default function DiscoverPage({ params }) {
  const { user } = useAuth();
  const { openAuth, navigate } = useNavigation();
  const toast = useToast();
  const [q, setQ] = useState(params.q || '');
  const state = useAsync(
    () => (q.trim() ? searchAll(q.trim()) : searchUsers('').then((d) => ({ users: d.users, posts: [] }))),
    [q, user?.id]
  );

  const setUsers = (fn) => state.setData((d) => ({ ...d, users: fn(d.users) }));
  const setPosts = (fn) => state.setData((d) => ({ ...d, posts: fn(d.posts) }));
  const actions = usePostActions(
    (id, change) =>
      setPosts((list) =>
        list.map((p) => (p.id === id ? { ...p, ...(typeof change === 'function' ? change(p) : change) } : p))
      ),
    (id) => setPosts((list) => list.filter((p) => p.id !== id))
  );

  const onFollow = async (id) => {
    if (!user) return openAuth();
    try {
      const { following } = await toggleFollow(id);
      setUsers((list) => list.map((u) => (u.id === id ? { ...u, isFollowing: following } : u)));
    } catch (err) {
      toast(err.message);
    }
  };

  const data = state.data;
  return (
    <>
      <ViewHeading title="Discover people" subtitle="Find creators and new connections across Clarke." />
      <div className="card-panel" style={{ padding: 16 }}>
        <input
          id="discoverSearch"
          placeholder="Search by name, username, post or #hashtag"
          style={{ width: '100%', padding: 13, border: '1px solid var(--line)', borderRadius: 9, outline: 0 }}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div id="discoverResults" style={{ marginTop: 14 }}>
          {state.loading && !data && <Loading text="Searching…" />}
          {state.error && <ErrorState message={state.error} onRetry={state.reload} />}
          {data?.users.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 11 }}>No members found.</p>}
          {data?.users.map((u) => (
            <div className="person-row" key={u.id}>
              <Avatar src={u.avatar} name={u.displayName} />
              <div
                className="person-info"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('member', { id: u.id })}
              >
                <b>{u.displayName}</b>
                <small>
                  @{u.username} · ID {u.id}
                </small>
              </div>
              <button className={`follow-btn${u.isFollowing ? ' following' : ''}`} onClick={() => onFollow(u.id)}>
                {u.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>
      {data?.posts.length > 0 && (
        <>
          <div className="feed-heading">
            <div>
              <h2>Posts</h2>
              <p>Matching “{q.trim()}”</p>
            </div>
          </div>
          <div className="feed-list">
            {data.posts.map((p) => (
              <PostCard key={p.id} post={p} actions={actions} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
