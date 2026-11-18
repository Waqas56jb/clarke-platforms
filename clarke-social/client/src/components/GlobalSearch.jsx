// Header search: members and posts as you type (debounced), with arrow-key navigation of the results.
import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { searchAll } from '../services/usersService';
import Avatar from './Avatar';

const DEBOUNCE_MS = 250;

export default function GlobalSearch() {
  const { navigate } = useNavigation();
  const [results, setResults] = useState(null);
  const [cursor, setCursor] = useState(-1);
  const wrapRef = useRef(null);
  const timer = useRef(null);
  const latest = useRef('');

  useEffect(() => {
    const hide = (e) => {
      if (!wrapRef.current?.contains(e.target)) setResults(null);
    };
    document.addEventListener('mousedown', hide);
    return () => {
      document.removeEventListener('mousedown', hide);
      clearTimeout(timer.current);
    };
  }, []);

  const run = async (q) => {
    try {
      const data = await searchAll(q);
      if (latest.current === q) {
        setResults(data);
        setCursor(-1);
      }
    } catch (err) {
      if (latest.current === q) setResults({ error: err.message });
    }
  };

  const onInput = (e) => {
    const q = e.target.value.trim();
    latest.current = q;
    clearTimeout(timer.current);
    if (!q) return setResults(null);
    timer.current = setTimeout(() => run(q), DEBOUNCE_MS);
  };

  const hits =
    results && !results.error
      ? [
          ...results.users
            .slice(0, 5)
            .map((u) => ({ key: `u${u.id}`, view: 'member', id: u.id, item: u, kind: 'user' })),
          ...results.posts.slice(0, 5).map((p) => ({ key: `p${p.id}`, view: 'post', id: p.id, item: p, kind: 'post' })),
        ]
      : [];

  const open = (hit) => {
    setResults(null);
    navigate(hit.view, { id: hit.id });
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') return setResults(null);
    if (!hits.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setCursor((c) => (c + step + hits.length) % hits.length);
    } else if (e.key === 'Enter' && cursor >= 0) {
      e.preventDefault();
      open(hits[cursor]);
    }
  };

  const renderHit = (hit, index) => (
    <button
      type="button"
      key={hit.key}
      className="search-hit search-result"
      role="option"
      aria-selected={index === cursor}
      onClick={() => open(hit)}
    >
      <Avatar src={hit.item.avatar} name={hit.item.displayName} size="sm" />
      <span className="list-row-main">
        <span className="list-row-title">{hit.item.displayName}</span>
        <span className="list-row-sub">
          {hit.kind === 'user' ? `@${hit.item.username}` : hit.item.body.slice(0, 80) || 'Photo or video post'}
        </span>
      </span>
    </button>
  );

  const users = hits.filter((h) => h.kind === 'user');
  const posts = hits.filter((h) => h.kind === 'post');

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <label className="search-field search-wrap">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Search Clarke</span>
        <input
          id="globalSearch"
          type="search"
          placeholder="Search people and posts"
          autoComplete="off"
          role="combobox"
          aria-expanded={Boolean(results)}
          aria-controls="searchResults"
          onInput={onInput}
          onKeyDown={onKeyDown}
        />
      </label>
      {results && (
        <div id="searchResults" className="search-popover search-results" role="listbox" aria-label="Search results">
          {results.error && <div className="search-empty">{results.error}</div>}
          {!results.error && !hits.length && (
            <div className="search-empty">
              <b>No results found.</b> Try another name or keyword.
            </div>
          )}
          {users.length > 0 && <div className="search-group">People</div>}
          {users.map((h) => renderHit(h, hits.indexOf(h)))}
          {posts.length > 0 && <div className="search-group">Posts</div>}
          {posts.map((h) => renderHit(h, hits.indexOf(h)))}
        </div>
      )}
    </div>
  );
}
