import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import ViewHeading from '../components/ViewHeading';
import { searchUsers, toggleFollow } from '../services/usersService';
import { initials } from '../utils/format';

export default function DiscoverPage() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState({});

  // A failed search keeps the last results on screen.
  const search = useCallback(
    (q) =>
      searchUsers(q)
        .then((data) => setUsers(data.users))
        .catch(() => {}),
    []
  );

  useEffect(() => {
    search('');
  }, [search]);

  const onFollow = async (id) => {
    if (!user) return openAuth();
    try {
      const d = await toggleFollow(id);
      setFollowing((f) => ({ ...f, [id]: d.following }));
    } catch (err) {
      toast(err.message);
    }
  };

  const visible = users.filter((u) => u.id !== user?.id);

  return (
    <>
      <ViewHeading title="Discover people" subtitle="Find creators and new connections across Clarke." />
      <div className="card-panel" style={{ padding: 16 }}>
        <input
          id="discoverSearch"
          placeholder="Search by name or username"
          style={{ width: '100%', padding: 13, border: '1px solid var(--line)', borderRadius: 9, outline: 0 }}
          onInput={(e) => search(e.target.value)}
        />
        <div id="discoverResults" style={{ marginTop: 14 }}>
          {visible.length ? (
            visible.map((u) => (
              <div className="person-row" key={u.id}>
                <div className="avatar avatar-purple">{initials(u.display_name)}</div>
                <div className="person-info">
                  <b>{u.display_name}</b>
                  <small>
                    @{u.username} · ID {u.id}
                  </small>
                </div>
                <button className={`follow-btn${following[u.id] ? ' following' : ''}`} onClick={() => onFollow(u.id)}>
                  {following[u.id] ? 'Following' : 'Follow'}
                </button>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: 11 }}>No members found yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
