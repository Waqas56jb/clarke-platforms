import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { searchAll } from '../services/usersService';
import Avatar from './Avatar';

// Searches members and posts as you type; picking a result opens that profile or post.
export default function GlobalSearch() {
  const { navigate } = useNavigation();
  const [results, setResults] = useState(null);
  const wrapRef = useRef(null);
  const latest = useRef('');

  useEffect(() => {
    const hide = (e) => {
      if (!wrapRef.current?.contains(e.target)) setResults(null);
    };
    document.addEventListener('click', hide);
    return () => document.removeEventListener('click', hide);
  }, []);

  const onInput = async (e) => {
    const q = e.target.value.trim();
    latest.current = q;
    if (!q) return setResults(null);
    try {
      const data = await searchAll(q);
      if (latest.current === q) setResults(data);
    } catch (err) {
      setResults({ error: err.message });
    }
  };

  const open = (view, id) => {
    setResults(null);
    navigate(view, { id });
  };

  const empty = results && !results.error && !results.users.length && !results.posts.length;

  return (
    <div className="search-wrap" ref={wrapRef}>
      <span>⌕</span>
      <input id="globalSearch" placeholder="Search people, videos and topics" autoComplete="off" onInput={onInput} />
      <div id="searchResults" className={`search-results${results ? '' : ' hidden'}`}>
        {results?.error && <div className="search-result">{results.error}</div>}
        {empty && <div className="search-result">Nothing found</div>}
        {results?.users?.length > 0 && <div className="search-section">PEOPLE</div>}
        {results?.users?.slice(0, 5).map((u) => (
          <div className="search-result" key={`u${u.id}`} onClick={() => open('member', u.id)}>
            <Avatar src={u.avatar} name={u.displayName} />
            <div>
              <b>{u.displayName}</b>
              <small>@{u.username}</small>
            </div>
          </div>
        ))}
        {results?.posts?.length > 0 && <div className="search-section">POSTS</div>}
        {results?.posts?.slice(0, 5).map((p) => (
          <div className="search-result" key={`p${p.id}`} onClick={() => open('post', p.id)}>
            <Avatar src={p.avatar} name={p.displayName} />
            <div>
              <b>{p.displayName}</b>
              <small>{p.body.slice(0, 80) || 'Photo / video post'}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
