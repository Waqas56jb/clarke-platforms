// A member's followers and the people they follow, with a local filter and follow buttons.
import { useState } from 'react';
import { ArrowLeft, Search, SearchX, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { EmptyState, ErrorState, Loading } from '../components/StateView';
import MemberRow from '../components/feed/MemberRow';
import { useAsync } from '../hooks/useAsync';
import { getMember, listFollowers, listFollowing } from '../services/usersService';

const TABS = [
  ['followers', 'Followers'],
  ['following', 'Following'],
];

function emptyText(tab, self, name) {
  if (tab === 'followers') return self ? 'No followers yet.' : `${name} has no followers yet.`;
  return self ? "You aren't following anyone yet." : `${name} isn't following anyone yet.`;
}

export default function ConnectionsPage({ params }) {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const id = Number(params.id);
  const [tab, setTab] = useState(params.tab === 'following' ? 'following' : 'followers');
  const [filter, setFilter] = useState('');
  const member = useAsync(() => getMember(id).then((d) => d.user), [id]);
  const list = useAsync(
    () => (tab === 'followers' ? listFollowers(id) : listFollowing(id)).then((d) => d.users),
    [id, tab, user?.id]
  );
  const self = user?.id === id;
  const name = member.data?.displayName || 'This member';

  const onFollowChange = (uid, isFollowing) => {
    const before = list.data.find((u) => u.id === uid)?.isFollowing;
    list.setData((users) => users.map((u) => (u.id === uid ? { ...u, isFollowing } : u)));
    // On your own profile, your Following count changes with each follow / unfollow.
    if (self && member.data && before !== isFollowing)
      member.setData((m) => ({ ...m, following: Math.max(0, m.following + (isFollowing ? 1 : -1)) }));
  };

  const term = filter.trim().toLowerCase();
  const shown = (list.data || []).filter(
    (u) => !term || u.displayName.toLowerCase().includes(term) || u.username.toLowerCase().includes(term)
  );

  let content;
  if (list.loading && !list.data)
    content = (
      <div className="card card-pad">
        <Loading text={`Loading ${tab}`} variant="list" count={6} />
      </div>
    );
  else if (list.error && !list.data)
    content = <ErrorState title={`Couldn't load ${tab}.`} message={list.error} onRetry={list.reload} />;
  else if (!list.data.length) content = <EmptyState icon={Users} title={emptyText(tab, self, name)} />;
  else if (!shown.length)
    content = (
      <EmptyState icon={SearchX} title="No results found.">
        Try another name or keyword.
      </EmptyState>
    );
  else
    content = (
      <ul className="card member-list connections-list">
        {shown.map((u) => (
          <MemberRow key={u.id} member={u} onFollowChange={onFollowChange} />
        ))}
      </ul>
    );

  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm back-button" onClick={() => navigate('member', { id })}>
        <ArrowLeft size={20} aria-hidden="true" />
        Back to profile
      </button>
      <header className="page-header">
        <div className="view-heading-text">
          <h1 className="truncate">{member.data ? member.data.displayName : 'Connections'}</h1>
          {member.data && <p>@{member.data.username}</p>}
        </div>
      </header>
      <div className="tabs" role="tablist" aria-label="Connections">
        {TABS.map(([key, label]) => (
          <button
            type="button"
            key={key}
            role="tab"
            id={`connectionsTab-${key}`}
            className="tab"
            aria-selected={tab === key}
            aria-controls="connectionsPanel"
            onClick={() => {
              setTab(key);
              setFilter('');
            }}
          >
            {label}
            {member.data && <span className="badge badge-neutral">{member.data[key]}</span>}
          </button>
        ))}
      </div>
      <div id="connectionsPanel" role="tabpanel" aria-labelledby={`connectionsTab-${tab}`} className="stack">
        {list.data?.length > 0 && (
          <label className="search-field">
            <Search size={20} aria-hidden="true" />
            <span className="sr-only">Filter {tab}</span>
            <input
              type="search"
              placeholder={`Search ${tab}`}
              value={filter}
              autoComplete="off"
              onChange={(e) => setFilter(e.target.value)}
            />
          </label>
        )}
        {content}
      </div>
    </>
  );
}
