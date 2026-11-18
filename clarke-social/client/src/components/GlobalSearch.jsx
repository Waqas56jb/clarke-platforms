import { useEffect, useRef, useState } from 'react';
import { searchUsers } from '../services/usersService';
import { initials } from '../utils/format';

export default function GlobalSearch() {
  const [results, setResults] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const hide = (e) => {
      if (!wrapRef.current?.contains(e.target)) setResults(null);
    };
    document.addEventListener('click', hide);
    return () => document.removeEventListener('click', hide);
  }, []);

  const onInput = async (e) => {
    const q = e.target.value.trim();
    if (!q) {
      setResults(null);
      return;
    }
    try {
      const { users } = await searchUsers(q);
      setResults(users.slice(0, 6));
    } catch {
      // Search suggestions are best-effort; the field keeps working.
    }
  };

  return (
    <div className="search-wrap" ref={wrapRef}>
      <span>⌕</span>
      <input id="globalSearch" placeholder="Search people, videos and topics" autoComplete="off" onInput={onInput} />
      <div id="searchResults" className={`search-results${results ? '' : ' hidden'}`}>
        {results &&
          (results.length ? (
            results.map((u) => (
              <div className="search-result" key={u.id}>
                <div className="avatar avatar-purple">{initials(u.display_name)}</div>
                <div>
                  <b>{u.display_name}</b>
                  <small>@{u.username}</small>
                </div>
              </div>
            ))
          ) : (
            <div className="search-result">No people found</div>
          ))}
      </div>
    </div>
  );
}
