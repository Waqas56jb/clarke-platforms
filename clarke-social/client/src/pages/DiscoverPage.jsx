import { useState } from 'react';
import { Hash, Search, SearchX, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { EmptyState, ErrorState, Loading } from '../components/StateView';
import ViewHeading from '../components/ViewHeading';
import MemberRow from '../components/feed/MemberRow';
import { useDebouncedValue } from '../components/feed/useDebouncedValue';
import { useAsync } from '../hooks/useAsync';
import { usePostActions } from '../hooks/usePostActions';
import { searchAll, searchUsers, trending } from '../services/usersService';

const patch = (list, id, change) =>
  list.map((x) => (x.id === id ? { ...x, ...(typeof change === 'function' ? change(x) : change) } : x));

function NoResults() {
  return (
    <EmptyState icon={SearchX} title="No results found.">
      Try another name or keyword.
    </EmptyState>
  );
}

// Trending hashtags offered on the Posts tab before anything is searched.
function TrendingTags({ onPick }) {
  const tags = useAsync(() => trending().then((d) => d.tags), []);
  return (
    <div className="card card-pad stack-sm">
      <p className="text-sm text-muted">Search for a keyword or #hashtag to find posts.</p>
      {tags.data?.length > 0 && (
        <>
          <h2 className="section-label">Trending this week</h2>
          <div className="chip-row discover-tags">
            {tags.data.map((t) => (
              <button type="button" key={t.tag} className="chip" onClick={() => onPick(t.tag)}>
                <Hash size={16} aria-hidden="true" />
                {t.tag.slice(1)}
                <span className="text-muted">{t.posts}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Members (everyone when the box is empty) and, for a search, matching posts and hashtags.
export default function DiscoverPage({ params }) {
  const { user } = useAuth();
  const [input, setInput] = useState(params.q || '');
  const [chosenTab, setTab] = useState(params.q?.startsWith('#') ? 'posts' : null);
  const q = useDebouncedValue(input.trim(), 300);
  const state = useAsync(
    () => (q ? searchAll(q) : searchUsers('').then((d) => ({ users: d.users, posts: [] }))),
    [q, user?.id]
  );
  const data = state.data;
  // Until the member picks a tab, show posts when a search matches posts but no members.
  const tab = chosenTab || (q && data && !data.users.length && data.posts.length ? 'posts' : 'members');

  const setPosts = (fn) => state.setData((d) => ({ ...d, posts: fn(d.posts) }));
  const actions = usePostActions(
    (id, change) => setPosts((list) => patch(list, id, change)),
    (id) => setPosts((list) => list.filter((p) => p.id !== id))
  );
  const onFollowChange = (id, isFollowing) =>
    state.setData((d) => ({ ...d, users: patch(d.users, id, { isFollowing }) }));

  const pickTag = (tag) => {
    setInput(tag);
    setTab('posts');
  };

  let results;
  if (state.loading && !data)
    results = (
      <div className="card card-pad">
        <Loading text="Searching" variant={tab === 'posts' ? 'feed' : 'list'} count={tab === 'posts' ? 2 : 5} />
      </div>
    );
  else if (state.error && !data) results = <ErrorState message={state.error} onRetry={state.reload} />;
  else if (tab === 'members')
    results = data.users.length ? (
      <ul className="card member-list">
        {data.users.map((u) => (
          <MemberRow key={u.id} member={u} onFollowChange={onFollowChange} />
        ))}
      </ul>
    ) : q ? (
      <NoResults />
    ) : (
      <EmptyState icon={Users} title="No people found.">
        Try adjusting your search or filters.
      </EmptyState>
    );
  else if (!q) results = <TrendingTags onPick={pickTag} />;
  else
    results = data.posts.length ? (
      <div className="feed-list">
        {data.posts.map((p) => (
          <PostCard key={p.id} post={p} actions={actions} />
        ))}
      </div>
    ) : (
      <NoResults />
    );

  const tabs = [
    ['members', 'Members', q && data ? data.users.length : null],
    ['posts', 'Posts', q && data ? data.posts.length : null],
  ];

  return (
    <>
      <ViewHeading title="Discover" subtitle="Find people, posts and hashtags across Clarke." />
      <div className="discover-search">
        <label className="search-field">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">Search Clarke</span>
          <input
            id="discoverSearch"
            type="search"
            placeholder="Search by name, username, post or #hashtag"
            value={input}
            autoComplete="off"
            onChange={(e) => setInput(e.target.value)}
          />
          {state.loading && data && <span className="spinner" aria-hidden="true" />}
        </label>
      </div>
      <div className="tabs" role="tablist" aria-label="Search results">
        {tabs.map(([key, label, count]) => (
          <button
            type="button"
            key={key}
            role="tab"
            id={`discoverTab-${key}`}
            aria-selected={tab === key}
            aria-controls="discoverResults"
            className="tab"
            onClick={() => setTab(key)}
          >
            {label}
            {count !== null && <span className="badge badge-neutral">{count}</span>}
          </button>
        ))}
      </div>
      <div
        id="discoverResults"
        role="tabpanel"
        aria-labelledby={`discoverTab-${tab}`}
        aria-busy={state.loading || undefined}
      >
        {results}
      </div>
    </>
  );
}
